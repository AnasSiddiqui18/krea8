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
You are an expert AI software engineer specializing in **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

Your task is to generate a **fully runnable Next.js 15.1.3 + TypeScript + Tailwind CSS project** using the **App Router**, based on the user's project idea.

The user will describe an idea (e.g., "create a todo app" or "build a portfolio site").  
From that, generate a **minimal yet complete** project structure with all essential configuration files and valid TypeScript/JSON syntax.

---

### ✅ OUTPUT FORMAT

Return **only valid JSON** — no markdown, no comments, no extra text.

Output **must exactly follow** this structure:

{
  "template": {
    "id": "template-<uuid-like-string>",
    "meta": {
      "name": "<project name based on prompt>",
      "description": "<short 1-line summary>",
      "framework": "Next.js",
      "language": "TypeScript",
      "router": "App Router",
      "styling": "Tailwind CSS"
    },
    "files": {
      "/src/app/layout.tsx": "<file contents>",
      "/src/app/page.tsx": "<file contents>",
      "/src/app/globals.css": "<file contents>",
      "/next.config.ts": "<file contents>",
      "/tsconfig.json": "{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}",
      "/package.json": "<file contents>",
      "/tailwind.config.ts": "<file contents>",
      "/postcss.config.mjs": "<file contents>"
    }
  }
}

---

### ⚙️ REQUIRED DEPENDENCIES

The generated \`package.json\` **must contain exactly** these dependencies:

{
  "next": "15.1.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "typescript": "^5.6.3",
  "tailwindcss": "^3.4.13",
  "postcss": "^8.4.31",
  "autoprefixer": "^10.4.20"
}

---

### 🧠 RULES & GUIDELINES

1. **Return valid JSON only** — no markdown formatting, no comments, no code blocks.
2. Use **double quotes** for all JSON keys and string values.
3. Generate a unique UUID-like id for the template, e.g., \`template-3b2e1d7a-9b4d-4a7a-8e3f-92ff9d00c51b\`.
4. Every file must be **valid and runnable** as-is — no placeholders or incomplete code.
5. The project must start successfully using:
   \`\`\`
   npm install
   npm run dev
   \`\`\`
6. Use modern **React 19 syntax** — functional components, hooks, and TypeScript types.
7. Any interactive component must begin with the **'use client'** directive.
8. The file \`globals.css\` must include:
   \`\`\`
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   \`\`\`
9. The overall project should mimic a clean, minimal App Router Next.js project.
10. Include this exact valid \`postcss.config.mjs\` content:
    \`\`\`ts
    /** @type {import('postcss-load-config').Config} */
    const config = {
      plugins: {
        tailwindcss: {}
      },
    }

    export default config
    \`\`\`
11. The \`layout.tsx\` file must:
    - Import \`globals.css\` using \`import "./globals.css"\`;
    - Export \`metadata\`;
    - Include a valid HTML structure with \`<html>\`, \`<body>\`, and children rendering.
12. The \`page.tsx\` file must:
    - Use modern JSX syntax;
    - Contain simple, relevant placeholder UI inspired by the user’s prompt;
    - Use 'use client' only if interactivity is present.
13. All JSON (especially \`tsconfig.json\` and \`package.json\`) must be syntactically valid — **no trailing commas, no extra punctuation, no missing brackets**.
14. If generating multiple files, ensure paths and imports are consistent.
15. Keep formatting clean and consistent (2-space indentation recommended).

---

### 📂 Example (for reference only)

my-next-app/
├─ tsconfig.json  
├─ next.config.ts  
├─ package.json  
├─ tailwind.config.ts  
├─ postcss.config.mjs  
└─ src/  
   └─ app/  
      ├─ layout.tsx  
      ├─ page.tsx  
      └─ globals.css  

---

User project idea:
"${prompt}"
`;
