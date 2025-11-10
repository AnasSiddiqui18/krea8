import { consumeStream, smoothStream, streamObject, streamText } from "ai";
import { generateWebsitePrompt, initialPrompt } from "../lib/prompt";
import { model } from "../lib/ai/google";
import { HTTPException } from "hono/http-exception";
import { fragmentSchema } from "@/lib/schema/schema";
import { Hono } from "hono";

export const websiteRouter = new Hono();

websiteRouter.post("/init", async (c) => {
  try {
    const { messages } = await c.req.json();

    const prompt = messages.at(0)?.parts.at(0)?.text;

    if (!prompt) throw new HTTPException(400, { message: "Prompt not found" });

    const result = streamText({
      model,
      prompt: initialPrompt(prompt),
      experimental_transform: smoothStream({
        delayInMs: 30,
        chunking: "word",
      }),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    throw new HTTPException(400, { message: "Failed to init website" });
  }
});

websiteRouter.post("/create-website", async (c) => {
  try {
    const { prompt } = await c.req.json();

    console.log("prompt reecived!!", prompt);

    if (!prompt) throw new HTTPException(400, { message: "Prompt not found" });

    const stream = await streamObject({
      model,
      schema: fragmentSchema,
      prompt: generateWebsitePrompt(prompt),
    });

    return stream.toTextStreamResponse();
  } catch (error) {
    throw new HTTPException(400, { message: "Failed to create website" });
  }
});
