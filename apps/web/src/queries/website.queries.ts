import { axios } from "@/lib/axios"
import { sendError, sendSuccess } from "@/lib/response"
import { initWebsiteSchema } from "@/schema/schema"

export const website = {
    init: async (prompt: string) => {
        try {
            const response = await axios.post("/website/init", { prompt })
            const validatedData = initWebsiteSchema.safeParse(response.data)
            if (!validatedData.success) return sendError("Invalid data received")
            return sendSuccess(validatedData.data)
        } catch (error) {
            return sendError("failed to init website")
        }
    },
}
