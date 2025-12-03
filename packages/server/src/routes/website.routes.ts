import { consumeStream, smoothStream, streamObject, streamText } from "ai";
import {
  generateWebsitePrompt,
  initialPrompt,
  updateWebsitePrompt,
} from "../lib/prompt";
import { model } from "../lib/ai/google";
import { HTTPException } from "hono/http-exception";
import { fragmentSchema, websiteUpdateSchema } from "@/lib/schema/schema";
import { Hono } from "hono";
import {
  getAvailablePort,
  getProjectStructure,
  updateOrCreateFiles,
} from "@/helpers/helpers";
import { NextTemplate } from "data";

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

    return result.toUIMessageStreamResponse({
      onFinish: ({ isAborted }) => {
        if (isAborted) {
          console.log("stream aborted");
        } else {
          console.log("stream closed normally");
        }
      },
      consumeSseStream: consumeStream,
    });
  } catch (error) {
    throw new HTTPException(400, { message: "Failed to init website" });
  }
});

websiteRouter.post("/create-website", async (c) => {
  try {
    const { prompt } = await c.req.json();

    console.log("prompt reecived!!", prompt);

    if (!prompt) throw new HTTPException(400, { message: "Prompt not found" });

    const port = await getAvailablePort();

    if (!port.success) {
      return c.json({
        success: false,
        message: "Website creation failed!! Failed to get port",
      });
    }

    const stream = streamObject({
      model,
      schema: fragmentSchema,
      prompt: generateWebsitePrompt(prompt, String(port.data), NextTemplate),
    });

    console.log("returning response");

    return stream.toTextStreamResponse();
  } catch (error) {
    console.error("website creation failed", error);
    throw new HTTPException(400, { message: "Failed to create website" });
  }
});

websiteRouter.patch("/update-website/:sbxId", async (c) => {
  try {
    const { sbxId } = c.req.param();
    const { prompt } = await c.req.json();

    const projectFiles = getProjectStructure(sbxId);

    const stream = streamObject({
      model: model,
      prompt: updateWebsitePrompt(projectFiles, prompt),
      schema: websiteUpdateSchema,
      onError: (err) => {
        console.log("failed to update website", err);
      },

      onFinish: (updatedContent) => {
        if (!updatedContent.object)
          return console.log("updated content is undefined");

        updateOrCreateFiles(updatedContent.object.code, sbxId);
      },
    });

    console.log("returning update response....");

    return stream.toTextStreamResponse();
  } catch (error) {
    return c.json({
      sucess: false,
      message: "failed to update file",
    });
  }
});
