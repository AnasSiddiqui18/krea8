import * as schema from "@/db/index"
import type { NeonQueryFunction } from "@neondatabase/serverless"
import type { betterAuth } from "better-auth"
import type { NeonHttpDatabase } from "drizzle-orm/neon-http"

export type TBetterAuth = ReturnType<typeof betterAuth>
export type db = NeonHttpDatabase<typeof schema> & { $client: NeonQueryFunction<false, false> }
export type Variables = { db: db; auth: TBetterAuth }
