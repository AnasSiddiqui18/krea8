import z from "zod";

export function toPrompt(initial_prompt: string) {
  return `
    You are an advanced AI software architect and senior full-stack developer.

    Your task is to **analyze the following project description** and generate a refined, detailed, and unambiguous **JSON object** that follows the provided schema.

    The goal is to produce structured data that can be passed to another LLM (the code generator) to build the project.

    ---

    ### SCHEMA (strictly follow this structure)
    {
      "prompt": string, // The final, enhanced prompt text — ready for the next LLM
      "tech_stack": string, // The primary technology or framework
      "framework_details": string[], // Additional frameworks, libraries, or UI kits
      "project_type": string, // Type of application (dashboard, chat app, portfolio, etc.)
      "project_description": string, // Short summary or purpose of the app
      "key_features": string[], // Core functionalities or pages
      "design_preferences": string[], // Any UI/UX or animation hints
      "state_management": string, // State management strategy (Zustand, Redux, etc.)
      "recommended_dependencies": string[], // Libraries or packages to consider
      "reasoning": string // Short reasoning for chosen stack and assumptions
    }

    ---

    ### RULES:

    1. **Tech Stack Detection**
       - Identify technologies explicitly mentioned in the input.
       - If none are found, default to:
         - "Next.js 15.1.3 (App Router)"
         - "TypeScript"
         - "TailwindCSS"
         - "ShadCN/UI"
         - "Zustand" for state management.
       - Mention these defaults clearly in both \`tech_stack\` and \`framework_details\`.

    2. **Project Understanding**
       - Expand the input logically to include:
         - The app’s **purpose or goal**
         - The **type of project**
         - **Key features or pages**
         - **Design or animation hints**
         - Any **API, database, or integration** if implied.

    3. **No Folder Structure**
       - Do not include or suggest any folder structure.
       - The code generator LLM will handle this.

    4. **Output Format**
       - Output **valid JSON only** (no markdown, no explanations).
       - Each key must exist (use empty strings or arrays if not applicable).

    ---

    ### INPUT PROJECT DESCRIPTION:
    ${initial_prompt}

    Now analyze the input carefully and return the final result strictly in **valid JSON** that matches the schema above.
    `;
}

export const initialPrompt = (prompt: string) => `
  You are an enthusiastic and friendly AI software engineer.
  
  A user has just shared their project idea below. Your job is to respond with a warm, human-like message that:
  - Excitedly acknowledges the project idea.
  - Adds a short, positive remark about the concept (e.g., why it’s a good or useful project in today’s world).
  - Sounds conversational, encouraging, and professional.
  - Does not include any implementation or technical details yet.
  - Focuses only on starting the project and motivating the user.
  
  Keep the message short (2–3 sentences max), natural, and engaging.
  
  Example tone:
  "That sounds awesome! A project like this can really help people stay organized and creative.  
  Getting things ready now — let’s bring your idea to life 🚀"
  
  User’s Project Idea:
  ${prompt}
  `;

export const initialPromptSchema = z.object({
  type: z.literal("status"),
  stage: z.literal("initializing"),
  message: z
    .string()
    .describe(
      "A short, human-like confirmation message that setup has started.",
    ),
});

export const projectTemplateSchema = z.object({
  template: z.object({
    id: z.string(),
    files: z.object({}),
  }),
});

export const generateWebsite = (prompt: string) => `
You are an expert AI software engineer.

The user will describe a project idea (for example: "create a todo app" or "build a portfolio site"). Your task is to generate a Next.js 15.1.3 + TypeScript starter project structure using the App Router.

Return the result strictly as a valid JSON object in the following format:

{
  "template": {
    "id": "<unique-id>",
    "files": {
      "/src/app/layout.tsx": "<file contents>",
      "/src/app/page.tsx": "<file contents>",
      "/src/app/globals.css": "<file contents>",
      "/next.config.ts": "<file contents>",
      "/tsconfig.json": "<file contents>",
      "/package.json": "<file contents>"
    }
  }
}

Example of a typical Next.js 15 App Router + TypeScript project structure:

my-next-app/
├─ tsconfig.json
├─ next.config.ts
├─ package.json
├─ tailwind.config.ts
└─ src/
   └─ app/
      ├─ layout.tsx
      ├─ page.tsx
      └─ globals.css

Guidelines:
1. The output must be valid JSON only — no markdown, code fences, or explanations.
2. Always use double quotes for all keys and string values.
3. The id should be a unique random UUID-like string, e.g. "template-fab39bb2-1b2e-49ed-9ea2-aedd4c7e8afe".
4. Each file must contain minimal but complete starter code reflecting a clean Next.js 15.1.3 + TypeScript project using the App Router.
5. The project must be runnable immediately with:
   npm install
   npm run dev
6. Use modern React syntax (functional components, hooks, and TypeScript interfaces where relevant).
7. Include the following exact dependency versions in package.json:
   - "next": "15.1.3"
   - "react": "^19.0.0"
   - "react-dom": "^19.0.0"
   - "@types/react": "^19"
   - "@types/react-dom": "^19"
   - "typescript": "^5.6.3" (or latest compatible)
8. Use the App Router structure inside /src/app (no pages/ directory, no legacy routing).
9. Keep code clean, readable, and minimal — resembling what you would get by running the official Next.js App Router TypeScript starter.
10. Do not include Vite or any unrelated tooling.

User prompt: ${prompt}
`;
