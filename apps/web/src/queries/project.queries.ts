import { axios } from "@/lib/axios"
import { sendError, sendSuccess } from "@/lib/response"
import { getProjects } from "@/schema/schema"

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
}
