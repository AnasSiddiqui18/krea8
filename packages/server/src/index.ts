import { Hono } from "hono";
import { cors } from "hono/cors";
import { websiteRouter } from "./routes/website.routes";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
  }),
);

app.get("/", (c) => {
  return c.text("server is working");
});

app.route("/website", websiteRouter);

export default { port: 3001, fetch: app.fetch, idleTimeout: 60 };
