import z from "zod";

export const initialPromptSchema = z.object({
  initial_prompt: z
    .string()
    .min(5, { message: "Prompt must be of 5 chars max" })
    .max(150, { message: "Prompt should be max of 150 chars" }),
});
