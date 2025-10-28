import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("server is working");
});

export default {
  port: 3001,
  fetch: app.fetch,
};
