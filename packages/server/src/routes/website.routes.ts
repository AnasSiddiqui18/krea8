import { consumeStream, smoothStream, streamObject, streamText } from "ai"
import { generateWebsitePrompt, initialPrompt, updateWebsitePrompt } from "../lib/prompt"
import { model } from "../lib/ai/google"
import { HTTPException } from "hono/http-exception"
import { fragmentSchema, websiteUpdateSchema } from "@/lib/schema/schema"
import { Hono } from "hono"
import { createFolderTree, getAvailablePort, getProjectStructure, updateOrCreateFiles } from "@/helpers/helpers"
import { NextTemplate } from "@/data"
import { Sandbox } from "@/docker/sandbox"
import { activeContainers } from "@/shared/index"
import { project, projectChats } from "@/db/schema/project.schema"
import { db } from "@/db/db"
import { auth } from "@/auth/auth"
import { eq, sql } from "drizzle-orm"
import { sendError, sendSuccess } from "@repo/shared/utils/response"
import { overlayCodeOnTopOfTemplate } from "@repo/shared/utils/overlay-code-on-template"
import type { Chat } from "@/types"

export const websiteRouter = new Hono()

export async function doesProjectExists(sbxId: string) {
    try {
        const projectExists = await db.query.project.findFirst({ where: eq(project.id, sbxId) })
        if (!projectExists) return sendError("Project not found")
        return sendSuccess("Project found")
    } catch (error) {
        return sendError("Failed to fetch project")
    }
}

async function updateChatInDB(sbxId: string, chat: Chat | Chat[]) {
    try {
        const updatedChat = await db.execute(sql`
            UPDATE ${projectChats}
            SET
                content = content || ${JSON.stringify(chat)}::jsonb,
                updated_at = now()
            WHERE ${projectChats.projectId} = ${sbxId}
            RETURNING *
        `)

        if (updatedChat.rowCount === 0) {
            return sendError("Failed to update chat")
        }

        return sendSuccess({ recordId: (updatedChat.rows[0] ?? {}).id })
    } catch (error) {
        return sendError("Failed to update chat")
    }
}

websiteRouter.post("/init", async (c) => {
    try {
        const session = await auth.api.getSession({ headers: c.req.header() })
        const { prompt } = await c.req.json()

        if (!session)
            return c.json({ sucess: false, message: "failed to get session", project_id: null }, { status: 400 })

        const sbxId = crypto.randomUUID()

        const transaction_res = await db.transaction(async (tx) => {
            const [projectResponse] = await tx
                .insert(project)
                .values({ id: sbxId, userId: session.user.id })
                .returning()

            if (!projectResponse) return sendError("failed to insert project record")

            const [chat] = await tx
                .insert(projectChats)
                .values({
                    projectId: projectResponse.id,
                    content: [{ content: prompt, role: "user", type: "text" }],
                })
                .returning()

            if (!chat) return sendError("failed to insert chat record")

            return sendSuccess("Project initialized")
        })

        if (!transaction_res.success)
            return c.json({ success: false, project_id: null, message: transaction_res.message })

        return c.json({
            success: true,
            project_id: sbxId,
            message: transaction_res.data,
        })
    } catch (error) {
        console.log("failed to init", error)
        return c.json({ success: false, message: "Failed to init project" })
    }
})

websiteRouter.post("/create-plan/:sbxId", async (c) => {
    try {
        const { prompt } = await c.req.json()
        const { sbxId } = c.req.param()

        const projectExists = await doesProjectExists(sbxId)

        if (!projectExists.success) return c.json({ success: false, message: projectExists.message })

        // const prompt = messages.at(0)?.parts.at(0)?.text

        // if (!prompt) c.json({ success: false, message: "Project not found" })

        const result = streamText({
            model,
            prompt: initialPrompt(prompt),
            experimental_transform: smoothStream({
                delayInMs: 30,
                chunking: "word",
            }),
            onFinish: async ({ text }) => {
                const updateResponse = await updateChatInDB(sbxId, { role: "assistant", type: "text", content: text })
                if (!updateResponse.success) return console.error(updateResponse.message)
                console.log(`website plan:: ${updateResponse.data}`)
            },

            onError: ({ error }) => {
                console.error("Plan creation failed", error)
            },
        })

        return result.toUIMessageStreamResponse({
            onFinish: ({ isAborted }) =>
                isAborted ? console.log("stream aborted") : console.log("stream closed normally"),

            onError: (error) => {
                return `Failed to generate plan ${error}`
            },

            consumeSseStream: consumeStream,
        })
    } catch (error) {
        throw new HTTPException(400, { message: "Failed to create website plan" })
    }
})

websiteRouter.post("/create-website/:sbxId", async (c) => {
    try {
        const { prompt } = await c.req.json()
        const port = await getAvailablePort()
        const { sbxId } = c.req.param()

        const projectExists = await doesProjectExists(sbxId)

        if (!projectExists.success) return c.json({ success: false, message: projectExists.message })

        if (!port.success) return c.json({ success: false, message: "Failed to get port" })

        console.log("🔌🔌🔌 available port 🔌🔌🔌", port.data)

        const [updatedProject] = await db
            .update(project)
            .set({ url: `http://localhost:${port.data}` })
            .returning()

        if (!updatedProject || !updatedProject.url)
            return c.json({ success: false, message: "Website creation failed" })

        const sandbox = new Sandbox(port.data.toString(), activeContainers)

        if (!prompt) return c.json({ success: false, message: "Prompt not found" })

        activeContainers.set(sbxId, {
            isServerReady: false,
            errorMessage: null,
            port: port.data.toString(),
            hasError: false,
        })

        const stream = streamObject({
            model,
            schema: fragmentSchema,
            prompt: generateWebsitePrompt(prompt, String(port.data), NextTemplate, sbxId),
            onFinish: async (data) => {
                if (!data.object) return console.error("Failed to get data")

                const code = data.object.fileBlocks
                if (!code) return console.log("code not found")

                const assistantMessages = code.map((block) => ({
                    role: "assistant" as const,
                    type: "text" as const,
                    content: block.rawFileBlock,
                }))

                const updateResponse = await updateChatInDB(sbxId, [
                    ...assistantMessages,
                    { role: "assistant", type: "text", content: data.object.completion_message },
                ])
                if (!updateResponse.success) return console.error(updateResponse.message)

                console.log(`website create:: ${updateResponse.data}`)

                const object = overlayCodeOnTopOfTemplate(code)

                createFolderTree(sbxId, object)
                sandbox.getOrPullImage("node:25-alpine3.21", sbxId)
            },
        })

        console.log("returning response")

        return stream.toTextStreamResponse()
    } catch (error) {
        console.error("website creation failed", error)
        throw new HTTPException(400, { message: "Failed to create website" })
    }
})

websiteRouter.patch("/update-website/:sbxId", async (c) => {
    try {
        const { sbxId } = c.req.param()

        const projectExists = await doesProjectExists(sbxId)

        if (!projectExists.success) return c.json({ success: false, message: projectExists.message })

        const { prompt } = await c.req.json()

        const projectFiles = getProjectStructure(sbxId)

        const stream = streamObject({
            model: model,
            prompt: updateWebsitePrompt(projectFiles, prompt),
            schema: websiteUpdateSchema,
            onError: (err) => {
                console.log("failed to update website", err)
            },
            onFinish: async (updatedContent) => {
                if (!updatedContent.object) return console.log("updated content is undefined")

                const code = updatedContent.object.fileBlocks

                updateOrCreateFiles(updatedContent.object.fileBlocks, sbxId)

                const assistantMessages = code.map((block) => ({
                    role: "assistant" as const,
                    type: "text" as const,
                    content: block.rawFileBlock,
                }))

                const updateResponse = await updateChatInDB(sbxId, assistantMessages)
                if (!updateResponse.success) return console.error(updateResponse.message)
                console.log(`website update:: ${updateResponse.data}`)
            },
        })

        console.log("returning update response....")

        return stream.toTextStreamResponse()
    } catch (error) {
        console.log("failed to update", error)
        return c.json({ sucess: false, message: "failed to update file" }, { status: 400 })
    }
})
