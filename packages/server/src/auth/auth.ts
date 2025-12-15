import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { TBetterAuth, db } from "@/types/index"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "@/db/schema/auth.schema"
import { env } from "@/env/env"

type TAuth = { auth: TBetterAuth; db: db }

export const __auth = (): TAuth => {
    const sql = neon(env.DATABASE_URL)
    const db = drizzle(sql, { schema })

    return {
        auth: betterAuth({
            database: drizzleAdapter(db, { provider: "pg", schema }),
            session: { freshAge: 0 },
            trustedOrigins: ["*"],
            advanced: {
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
        }),
        db,
    }
}
