import { z } from "zod";
import { oc } from "@orpc/contract";

const createWebsiteInputSchema = z.object({
  prompt: z.string(),
});

const createWebsiteOutputSchema = z.object({
  template: z.object({
    id: z.string(),
    files: z.any(),
  }),
});

export const createWebsite = oc
  .input(createWebsiteInputSchema)
  .route({ path: "/website/create-website", method: "POST" });

export const websiteContract = oc.router({
  create: createWebsite,
});
