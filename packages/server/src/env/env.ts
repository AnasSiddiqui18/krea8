import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
    server: {
        DATABASE_URL: z.url(),
        GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
        BETTER_AUTH_SECRET: z.string(),
        BETTER_AUTH_URL: z.string(),
        AWS_BUCKET_NAME: z.string(),
        AWS_ACCESS_REGION: z.string(),
        AWS_ACCESS_KEY: z.string(),
        AWS_ACCESS_SECRET: z.string(),
    },
    runtimeEnv: process.env,
})
