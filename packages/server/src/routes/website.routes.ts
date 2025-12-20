import { consumeStream, smoothStream, streamObject, streamText } from "ai"
import { generateWebsitePrompt, initialPrompt, updateWebsitePrompt } from "../lib/prompt"
import { model } from "../lib/ai/google"
import { HTTPException } from "hono/http-exception"
import { fragmentSchema, websiteUpdateSchema } from "@/lib/schema/schema"
import { Hono } from "hono"
import {
    createFolderTree,
    extractCodeContent,
    getAvailablePort,
    getProjectStructure,
    updateOrCreateFiles,
} from "@/helpers/helpers"
import { NextTemplate } from "@/data"
import { Sandbox } from "@/docker/sandbox"
import { activeContainers } from "@/shared"
import { project } from "@/db/schema/project.schema"
import { db } from "@/db/db"
import { auth } from "@/auth/auth"

export const websiteRouter = new Hono()

websiteRouter.get("/init", async (c) => {
    try {
        const session = await auth.api.getSession({ headers: c.req.header() })

        if (!session) {
            return c.json({ sucess: false, message: "failed to get session" }, { status: 400 })
        }

        const sbxId = crypto.randomUUID()
        const portRes = await getAvailablePort()

        if (!portRes.success) return c.json({ success: false, message: "Failed to get port" })

        await db.insert(project).values({
            id: sbxId,
            url: `http://localhost:${portRes.data}`,
            userId: session.user.id,
        })

        activeContainers.set(sbxId, {
            isServerReady: false,
            errorMessage: null,
            port: portRes.data.toString(),
            hasError: false,
        })

        return c.json({ status: "init_successfully", server_url: null, project_id: sbxId })
    } catch (error) {
        console.log("failed to init", error)

        throw new HTTPException(400, { message: "Failed to init website" })
    }
})

websiteRouter.post("/create-plan", async (c) => {
    try {
        const { messages } = await c.req.json()

        const prompt = messages.at(0)?.parts.at(0)?.text

        if (!prompt) throw new HTTPException(400, { message: "Prompt not found" })

        const result = streamText({
            model,
            prompt: initialPrompt(prompt),
            experimental_transform: smoothStream({
                delayInMs: 30,
                chunking: "word",
            }),
        })

        return result.toUIMessageStreamResponse({
            onFinish: ({ isAborted }) => {
                if (isAborted) {
                    console.log("stream aborted")
                } else {
                    console.log("stream closed normally")
                }
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
        const portRes = await getAvailablePort()
        const { sbxId } = c.req.param()

        if (!portRes.success) {
            return c.json({ success: false, message: "Failed to get port" })
        }

        const sandbox = new Sandbox(portRes.data.toString(), activeContainers)

        if (!prompt) throw new HTTPException(400, { message: "Prompt not found" })

        const port = await getAvailablePort()

        if (!port.success) {
            return c.json({
                success: false,
                message: "Website creation failed!! Failed to get port",
            })
        }

        const stream = streamObject({
            model,
            schema: fragmentSchema,
            prompt: generateWebsitePrompt(prompt, String(port.data), NextTemplate),
            onFinish: async (data) => {
                const code = data.object?.code

                if (!code) return console.log("code not found")

                const object = extractCodeContent(code)

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
        const { prompt } = await c.req.json()

        const projectFiles = getProjectStructure(sbxId)

        const stream = streamObject({
            model: model,
            prompt: updateWebsitePrompt(projectFiles, prompt),
            schema: websiteUpdateSchema,
            onError: (err) => {
                console.log("failed to update website", err)
            },
            onFinish: (updatedContent) => {
                if (!updatedContent.object) return console.log("updated content is undefined")
                updateOrCreateFiles(updatedContent.object.code, sbxId)
            },
        })

        console.log("returning update response....")

        return stream.toTextStreamResponse()
    } catch (error) {
        console.log("failed to update", error)
        return c.json(
            {
                sucess: false,
                message: "failed to update file",
            },
            { status: 400 },
        )
    }
})
