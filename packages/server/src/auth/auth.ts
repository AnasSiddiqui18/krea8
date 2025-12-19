import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import * as schema from "@/db/schema/index"
import { db } from "@/db/db"

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: "pg", schema }),
    session: { freshAge: 0 },
    trustedOrigins: ["*"],
    advanced: {
        database: { generateId: false },
        cookies: {
            session_token: {
                name: "session",
                attributes: {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                },
            },
        },
    },
    emailAndPassword: { enabled: true },
})
