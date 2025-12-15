import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
    server: {
        DATABASE_URL: z.url(),
        GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
        BETTER_AUTH_SECRET: z.string(),
        BETTER_AUTH_URL: z.string(),
    },
    runtimeEnv: process.env,
})
