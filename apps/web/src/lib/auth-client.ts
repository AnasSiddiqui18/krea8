import { createAuthClient } from "better-auth/react"

if (!process.env.NEXT_PUBLIC_SERVER_URL) throw new Error("Server url not found")

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    fetchOptions: { credentials: "include" },
})
