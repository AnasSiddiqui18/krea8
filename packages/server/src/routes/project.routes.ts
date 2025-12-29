import { auth } from "@/auth/auth"
import { db } from "@/db/db"
import { project, projectChats } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Hono } from "hono"

export const projectRouter = new Hono()

projectRouter.get("/get", async (c) => {
    try {
        const session = await auth.api.getSession({ headers: c.req.header() })

        if (!session?.session)
            return c.json({
                success: false,
                message: "Session not found",
            })

        const user = session.user

        const projects = await db.query.project.findMany({
            where: eq(project.userId, user.id),
            columns: {
                image: true,
                summary: true,
                id: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
                url: true,
            },
        })

        if (!projects.length) return c.json({ success: false, message: "Projects not found" })

        return c.json({ success: true, message: "Projects fetched", projects })
    } catch (error) {
        return c.json({ success: false, message: "Failed to fetch projects" }, { status: 500 })
    }
})

projectRouter.get("/get-chats/:projectId", async (c) => {
    try {
        const { projectId } = c.req.param()

        console.log("project id", projectId)

        const session = await auth.api.getSession({ headers: c.req.header() })

        if (!session?.session)
            return c.json({
                success: false,
                message: "Session not found",
                chats: [],
            })

        const chats = await db.query.projectChats.findFirst({ where: eq(projectChats.projectId, projectId) })

        if (!chats) return c.json({ chats: [], success: true, message: "Chats not found" })

        return c.json({ chats: chats, success: true, message: "Chats fetched successfully" })
    } catch (error) {
        return c.json({ chats: [], success: false, message: "Failed to fetched chats" }, { status: 500 })
    }
})
