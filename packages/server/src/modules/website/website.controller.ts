import { implement, ORPCError } from "@orpc/server";
import { websiteContract } from "./website.contract";
import { generateWebsite, initialPrompt } from "@/lib/prompt";
import { model } from "@/lib/ai/google";
import { smoothStream, streamObject, streamText } from "ai";

const os = implement(websiteContract);

export const websiteRouter = os.router({
  create: os.create.handler(async function* ({ input }) {
    try {
      const { prompt } = input;

      console.log("prompt received", prompt);

      const result = streamText({
        model,
        prompt: initialPrompt(prompt),
        experimental_transform: smoothStream({
          delayInMs: 30,
          chunking: "word",
        }),
      });

      for await (const text of result.textStream) {
        yield { data: "message", message: text };
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      yield {
        data: "status",
        message: "Understanding your project structure...",
      };

      await new Promise((resolve) => setTimeout(resolve, 700));

      yield {
        data: "status",
        message: "Planning system design & layout",
      };

      await new Promise((resolve) => setTimeout(resolve, 700));

      yield {
        data: "status",
        message: "Generating initial project template",
      };

      const templateFiles = streamObject({
        model,
        prompt: generateWebsite(prompt),
        output: "no-schema",
      });

      for await (const chunk of templateFiles.textStream) {
        yield {
          data: "code",
          message: chunk,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      yield {
        data: "status",
        message: "Template streamed successfully",
      };
    } catch (error) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to init website",
      });
    }
  }),
});
