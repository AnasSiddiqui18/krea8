import { implement } from "@orpc/server";
import { contract } from "./contract";
import { websiteRouter } from "@/modules/website/website.controller";

export const router = implement(contract).router({
  website: websiteRouter,
});
