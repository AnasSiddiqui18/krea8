import { Hono } from "hono"
import { cors } from "hono/cors"
import { websiteRouter } from "./routes/website.routes"
import { sandboxRouter } from "./routes/sandbox.routes"
import { __auth } from "@/auth/auth"
import { contextStorage } from "hono/context-storage"
import type { Variables } from "./types"

type THono = { Variables: Variables }
const app = new Hono<THono>()

app.use(
    "*",
    cors({
        origin: "http://localhost:3002",
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        allowMethods: ["POST", "GET", "OPTIONS"],
    }),
)

app.use(contextStorage())

app.use("*", async (c, next) => {
    const { auth, db } = __auth()
    c.set("auth", auth)
    c.set("db", db)
    await next()
})

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
    const auth = c.get("auth")
    return await auth.handler(c.req.raw)
})

app.get("/", (c) => {
    return c.json({
        status: "server is working",
    })
})

app.route("/website", websiteRouter)
app.route("/sandbox", sandboxRouter)

export default { port: 3001, fetch: app.fetch, idleTimeout: 60 }
