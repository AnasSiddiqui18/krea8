import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI();
export const model = google("gemini-2.5-flash");
