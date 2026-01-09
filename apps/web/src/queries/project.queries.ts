import { axios } from "@/lib/axios"
import { sendError, sendSuccess } from "@/lib/response"
import { getProjectChats, getProjects } from "@/schema/schema"

export const projects = {
    get: async () => {
        try {
            const projects = await axios.get("/projects/get")
            const validatedData = getProjects.safeParse(projects.data)
            if (validatedData.success && validatedData.data.success) return sendSuccess(validatedData.data.projects)
            return sendError("Failed to fetch projects")
        } catch (error) {
            return sendError("Failed to fetch projects")
        }
    },

    getProjectsChats: async (projectId: string) => {
        try {
            const projects = await axios.get(`/projects/get-chats/${projectId}`)
            const validatedData = getProjectChats.safeParse(projects.data)
            if (validatedData.success && validatedData.data.success) return sendSuccess(validatedData.data)

            console.log(validatedData.error)

            return sendError("Failed to fetch project chats")
        } catch (error) {
            return sendError("Failed to fetch project chats")
        }
    },
}
