import { Hono } from "hono";
import { cors } from "hono/cors";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { router } from "./router";
import { ORPCError } from "@orpc/server";

const app = new Hono();

const handler = new OpenAPIHandler(router);

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
    // credentials: true,
  }),
);

app.get("/", (c) => {
  return c.text("server is working");
});

app.use("/api/*", async (c) => {
  const { response } = await handler.handle(c.req.raw, {
    prefix: "/api",
  });

  if (!response) {
    return Response.json(
      new ORPCError("NOT_FOUND", {
        message: "Endpoint not found",
      }),
      { status: 404 },
    );
  }

  return response;
});

export default {
  port: 3001,
  fetch: app.fetch,
};
