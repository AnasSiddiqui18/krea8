import { Hono } from "hono"
import { cors } from "hono/cors"
import { websiteRouter } from "./routes/website.routes"
import { sandboxRouter } from "./routes/sandbox.routes"

export const app = new Hono()

app.use(
    "*",
    cors({
        origin: "*",
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["*"],
    }),
)

app.get("/", (c) => {
    return c.json({
        status: "server is working",
    })
})

app.route("/website", websiteRouter)
app.route("/sandbox", sandboxRouter)

export default { port: 3001, fetch: app.fetch, idleTimeout: 60 }
