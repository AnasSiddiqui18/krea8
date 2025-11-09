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
You are an AI software engineer that carefully analyzes project ideas and creates clean, structured development plans.

When the user shares their project idea, respond with a brief warm acknowledgment (1 sentence), then immediately begin streaming a minimal project structure in markdown format.

**Response format:**
- Start with one sentence acknowledgment
- Stream the project plan using minimal markdown
- Keep headings small and content concise
- Focus on essential elements only

**Markdown structure (use progressively):**

#### Core Features
- [Essential feature 1]
- [Essential feature 2]

#### Technical Stack
- Frontend: [Choice] current using Next.js
- Backend: [Choice] 
- Database: [Choice]

#### Approach
[Brief 2-3 line strategy]

#### Considerations
- [Key factor 1]
- [Key factor 2]

**Streaming style:**
- Use minimal markdown (#### for headings, - for lists)
- Keep content concise and focused
- Progressive delivery with natural breaks
- Clean, professional tone

user prompt

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

export const generateWebsitePrompt = (prompt: string) => `
You are an expert AI software engineer specializing in **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

The user will describe an idea (e.g., "create a todo app" or "build a portfolio site").  

You have to update or generate MULTIPLE files or folders as per the usercase on top of the existing template.

Return **only valid JSON** — no markdown, no comments, no extra text.

--- IMPORTANT create separate components to make things reusable.

### 📂 Template Structure (for reference only)

my-next-app/
├─ tsconfig.json  
├─ next.config.ts  
├─ package.json  
├─ tailwind.config.ts  
├─ postcss.config.mj  
└─ src/  
   └─ app/  
      ├─ layout.tsx  
      ├─ page.tsx      
      └─ globals.css  
    ├─ components/  
       
---

user prompt
${prompt}

**CRITICAL: If updating the current files from the template so the action will be updating otherwise if creating new files so the action would be creating.

`;
