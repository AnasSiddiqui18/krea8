import { Hono } from "hono"
import { cors } from "hono/cors"
import { websiteRouter } from "./routes/website.routes"
import { sandboxRouter } from "./routes/sandbox.routes"
import { auth } from "@/auth/auth"
import type { Variables } from "./types"

type THono = { Variables: Variables }
const app = new Hono<THono>()

app.use(
    "*",
    cors({
        origin: "http://localhost:3002",
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        allowMethods: ["*"],
    }),
)

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
    return await auth.handler(c.req.raw)
})

app.get("/", async (c) => {
    return c.json({
        status: "server is working",
    })
})

app.route("/website", websiteRouter)
app.route("/sandbox", sandboxRouter)

export default { port: 3001, fetch: app.fetch, idleTimeout: 60 }
