import { Hono } from "hono"
import { getFile, updateFile } from "@/helpers/helpers"
import { activeContainers } from "@/shared"

export const sandboxRouter = new Hono()

sandboxRouter.get("/status/:sbxId", async (c) => {
    try {
        const { sbxId } = c.req.param()

        const containerInfo = activeContainers.get(sbxId)

        if (!containerInfo) {
            return c.json({
                status: "failed",
                message: "Sandbox not found",
                server_url: null,
            })
        }

        const { errorMessage, hasError, isServerReady } = containerInfo

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

        // TODO only update the isServerReady when the server is fully ready

        return c.json({
            status: "completed",
            server_url: `http://localhost:${containerInfo.port}`,
            message: "server started successfully",
        })
    } catch (error) {
        console.error("Failed to spin sandbox")
        return c.json({
            status: "failed",
            message: "Failed to spin sandbox",
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
