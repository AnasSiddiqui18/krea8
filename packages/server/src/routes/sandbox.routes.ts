import { Hono } from "hono"
import { generateWebsiteScreenshotAndStoreImage, getFile, updateFile } from "@/helpers/helpers"
import { activeContainers } from "@/shared"
import { generateText } from "ai"
import { model } from "@/lib/ai/google"
import { db } from "@/db/db"
import { project } from "@/db/schema/project.schema"
import { eq } from "drizzle-orm"
import { generateSummary } from "@/lib/prompt"

export const sandboxRouter = new Hono()

sandboxRouter.get("/status/:sbxId", async (c) => {
    try {
        const { sbxId } = c.req.param()
        const prompt = await c.req.query("prompt")
        const containerInfo = activeContainers.get(sbxId)

        if (!containerInfo) {
            return c.json({
                status: "failed",
                message: "Sandbox not found",
                server_url: null,
            })
        }

        if (!prompt) {
            return c.json({
                status: "failed",
                message: "Prompt not found",
                server_url: null,
            })
        }

        const { errorMessage, hasError, isServerReady, port } = containerInfo

        if (hasError)
            return c.json({
                status: "failed",
                message: errorMessage,
                server_url: null,
            })

        if (!isServerReady) {
            return c.json({
                message: "Server not ready",
                status: "progress",
                server_url: null,
            })
        }

        // this will run only once, updating the db + returning complete status to the frontend

        const summary = await generateText({
            model,
            prompt: generateSummary(prompt),
        })

        const updatedProject = await db
            .update(project)
            .set({ summary: summary.text })
            .where(eq(project.id, sbxId))
            .returning()

        const updatedSummary = updatedProject.at(0)?.summary

        if (updatedSummary && updatedSummary !== summary.text)
            return c.json({ status: "failed", server_url: null, message: "failed to update summary in DB" })

        generateWebsiteScreenshotAndStoreImage(`http://localhost:${port}`, sbxId)
            .then((data) => console.log("image operation completed", data))
            .catch((err) => console.error("Failed to capture screenshot", err))

        return c.json({
            status: "completed",
            server_url: `http://localhost:${containerInfo.port}`,
            message: "server started successfully",
        })
    } catch (error) {
        console.error("Status block failed!!", error)

        return c.json({
            status: "failed",
            message: "Status block failed!!",
            server_url: null,
        })
    }
})

sandboxRouter.get("/file/:sbxId", async (c) => {
    try {
        const { filePath } = c.req.query()
        const { sbxId } = c.req.param()

        if (!filePath || !sbxId) return c.json({ message: "file and sandbox id is required" })

        const response = await getFile(filePath, sbxId)

        if (!response.success) {
            return c.json({
                message: "failed to get file",
                file: null,
                success: false,
            })
        }

        return c.json({ ...response, message: "File get successfully" })
    } catch (error) {
        return c.json({ message: "failed to get file", file: null, success: false })
    }
})

// updating manually

sandboxRouter.patch("/file/:sbxId", async (c) => {
    try {
        const { sbxId } = c.req.param()
        const { filePath } = c.req.query()
        const { content } = await c.req.json()

        if (!filePath || !sbxId || !content) {
            return c.json({
                success: false,
                message: "failed to update file",
            })
        }

        const updateRes = await updateFile(filePath, content, sbxId)

        if (!updateRes.success) return c.json({ success: false, message: "failed to update file" })

        return c.json({ success: true, message: "file updated successfully" })
    } catch (error) {
        return c.json({ success: false, message: "failed to update file" })
    }
})
