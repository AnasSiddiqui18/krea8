import { NextTemplate } from "data";
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
- Frontend: [Next.js] 

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

// export const generateWebsitePrompt = (userPrompt: string, port: string) => `
// You are a professional code generator AI. Your task is to generate or update files for a Next.js 15.1.3 project using the following starter template:

// ### 📂 Template Reference (do not modify unless instructed)
// my-next-app/
// ├─ tsconfig.json
// ├─ next.config.ts
// ├─ package.json
// ├─ tailwind.config.mjs
// ├─ postcss.config.mjs
// └─ src/
//    └─ app/
//       ├─ layout.tsx
//       ├─ page.tsx
//       └─ globals.css
//    ├─ components/

// **User requirements:**
// "${userPrompt}"

// --- IMPORTANT: Create separate, reusable components where applicable.

// **Rules for generation:**

// 1. **File Operations**
//    - Only create new files if they do not exist. Use "action": "creating".
//    - Update existing files only if necessary. Use "action": "updating".
//    - Do not break any existing functionality or structure of the starter template.

// 2. **File Structure**
//    - Each file must be wrapped in a "<coderocketFile>" tag exactly as shown:
//      <coderocketFile name="FILE_NAME">
//      ACTUAL FILE CONTENT HERE
//      </coderocketFile>
//    - FILE_NAME must exactly match the file name.
//    - The code inside the wrapper must be fully formatted, complete, and ready to execute.

// 3. **Schema Compliance**
//    - Output each file strictly as a JSON object with these fields only:
//      {
//        "action": "creating" | "updating",
//        "file_name": "Name of the file",
//        "file_path": "Relative path including the file name",
//        "file_content": "<coderocketFile name=\\"FILE_NAME\\">...file content...</coderocketFile>"
//      }
//    - **Do not include any other text, messages, explanations, or comments in any field.**
//    - Do not add placeholder text like "Here is the JSON requested" or any extra content.

// 4. **Formatting & Restrictions**
//    - Preserve indentation, formatting, and all existing imports.
//    - Do not add SVGs, external assets, or inline comments for explanations.
//    - Do not remove or rename existing files unless explicitly required.
//    - Avoid breaking changes: all existing pages, layouts, and components must remain functional.

// 5. **Positive Example**
// {
//   "action": "updating",
//   "file_name": "page.tsx",
//   "file_path": "src/app/page.tsx",
//   "file_content": "<coderocketFile name=\\"page.tsx\\">
// 'use client';

// import React from 'react';

// export default function Page() {
//   return (
//     <div>
//       <h1>Todo App</h1>
//     </div>
//   );
// }
// </coderocketFile>"
// }

// 6. **Negative Examples (Avoid these at any cost)**
// - Missing wrapper:
//   "<div>Hello World</div>"
// - Breaking template structure:
//   "Deleted layout.tsx or removed imports from globals.css"
// - Wrong file name in wrapper:
//   "<coderocketFile name='app.js'>console.log('Hello');</coderocketFile>"
// - Any extra messages, comments, or text in JSON fields:
//   "Here is the JSON requested"
// - Adding external SVGs:
//   "<img src='icon.svg' />"

// 7. **Multiple Files**
//    - If multiple files need updates, produce an **array of JSON objects**, each strictly following the schema and rules above.

// *IMAGE USAGE*

// Whenever using images must use html img tag to use images, when generating any image URL for products, cards, or UI elements, do NOT use real or external image sources. Always use placeholder images from https://placehold.co.
// Format every image as:

// https://placehold.co/{WIDTH}x{HEIGHT}/{BACKGROUND_HEX}/{TEXT_HEX}/png?text={TITLE_TEXT}

// Rules:
// - WIDTHxHEIGHT should match the component's expected dimensions (default: 1920x1080 if unspecified).
// - BACKGROUND_HEX should be a color that matches the theme of the product (e.g., candy = f8e9a1, strawberry = ff6384, grape = 7d3cff).
// - TEXT_HEX should always be high-contrast to the background (usually "ffffff").
// - TITLE_TEXT should use "+" instead of spaces and reflect the product name (e.g., "Jelly+Beans+Mix").

// If no product name is available, use a generic descriptive text like "Placeholder+Image".

// *PORT USAGE*

// Update the dev script inside package.json file of the Next.js from the provided Nextjs template reference to use the provided port number for the development server. Locate the 'dev' script inside the 'scripts' section of package.json and replace the existing port configuration (if any) with the provided port. Use the format: 'next dev --port ${port}'. Only modify the 'dev' script; all other scripts and fields should remain unchanged. Make sure the output is valid JSON. Example: if port = 4000, the 'dev' script value should be 'next dev --port 4000'. Do not modify any other script, dependecies versions etc

// **IMPORTANT:** Ensure the generated code is fully functional, runnable as-is, and that no extra text exists anywhere in the output outside the JSON objects.
// `;

export const generateWebsitePrompt = (userPrompt: string, port: string) => `
You are a professional code generator AI. Your task is to generate or update files for a Next.js 15.1.3 project using the following starter template:

### 📂 Template Reference (do not modify unless instructed)
my-next-app/
├─ tsconfig.json  
├─ next.config.ts  
├─ package.json  
├─ tailwind.config.mjs  
├─ postcss.config.mjs  
└─ src/  
   └─ app/  
      ├─ layout.tsx  
      ├─ page.tsx      
      └─ globals.css  
   ├─ components/ 

**User requirements:**  
"${userPrompt}"

--- IMPORTANT: Create separate, reusable components where applicable.  

**Rules for generation:**

1. **File Operations**
   - Only create new files if they do not exist. Use "action": "creating".
   - Update existing files only if necessary. Use "action": "updating".
   - Do not break any existing functionality or structure of the starter template.

2. **File Structure**
   - Each file must be wrapped in a "<coderocketFile>" tag exactly as shown:
     <coderocketFile name="FILE_NAME">
     ACTUAL FILE CONTENT HERE
     </coderocketFile>
   - FILE_NAME must exactly match the file name.
   - The code inside the wrapper must be fully formatted, complete, and ready to execute.

3. **Schema Compliance**
   - Output each file strictly as a JSON object with these fields only:
     {
       "action": "creating" | "updating",
       "file_name": "Name of the file",
       "file_path": "Relative path including the file name",
       "file_content": "<coderocketFile name=\\"FILE_NAME\\">...file content...</coderocketFile>"
     }
   - **Do not include any other text, messages, explanations, or comments in any field.**
   - Do not add placeholder text like "Here is the JSON requested" or any extra content.

4. **Formatting & Restrictions**
   - Preserve indentation, formatting, and all existing imports.
   - Do not add SVGs, external assets, or inline comments for explanations.
   - Do not remove or rename existing files unless explicitly required.
   - Avoid breaking changes: all existing pages, layouts, and components must remain functional.

5. **Positive Example**
{
  "action": "updating",
  "file_name": "page.tsx",
  "file_path": "src/app/page.tsx",
  "file_content": "<coderocketFile name=\\"page.tsx\\">
'use client';

import React from 'react';

export default function Page() {
  return (
    <div>
      <h1>Todo App</h1>
    </div>
  );
}
</coderocketFile>"
}

6. **Negative Examples (Avoid these at any cost)**
- Missing wrapper:
  "<div>Hello World</div>"
- Breaking template structure:
  "Deleted layout.tsx or removed imports from globals.css"
- Wrong file name in wrapper:
  "<coderocketFile name='app.js'>console.log('Hello');</coderocketFile>"
- Any extra messages, comments, or text in JSON fields:
  "Here is the JSON requested"
- Adding external SVGs:
  "<img src='icon.svg' />"

7. **Multiple Files**
   - If multiple files need updates, produce an **array of JSON objects**, each strictly following the schema and rules above.

*IMAGE USAGE (STRICT)*


────────────────────────────────────────
IMAGE SELECTION RULES (VERY STRICT)
────────────────────────────────────────

You are given an image ID data structure:

const imagePool = {
  team: [177, 65, 91, 203, 188, 27, 22, 64, 65, 91, 177, 281, 338, 349, 399, 447, 446, 473, 633, 646, 661, 665, 669, 885, 978, 996, 1005, 1011],
  tech: [26, 6, 8, 9, 0, 48, 180, 201, 250, 370, 435, 445, 531, 532],
  nature: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 29, 28, 25, 33, 37, 38, 57, 66, 67, 70, 71, 89, 90, 92, 94, 95, 120, 121, 213, 278, 313, 379, 410, 411, 695, 702, 744, 916, 1050],
  vehicles: [514, 605, 757, 804, 892, 1013, 1070, 1071, 1072, 133, 183, 146],
  animals: [1084, 1062, 1074, 1025, 1024, 1012, 1003, 837, 783, 718],
};

────────────────────────────────────────
HOW TO CHOOSE IMAGE IDS
────────────────────────────────────────

When generating a component that needs images, ALWAYS:

1. **Identify the most relevant category** based on context:
   - team, people, staff, employees → use "imagePool.team"
   - tech, software, apps, UI, computers → use "imagePool.tech"
   - nature, outdoors, plants → use "imagePool.nature"
   - cars, bikes, transport → use "imagePool.vehicles"
   - animals, pets → use "imagePool.animals"

2. If the category is recognized:
   - Pull IDs IN ORDER from the corresponding array.
   - If you need 4 images, take the first 4 IDs from that category.
   - If you need more than available, loop the array.

3. If NO category matches:
   - Generate a RANDOM ID from **0–1000**.

4. NEVER invent IDs.  
5. NEVER mix categories unless explicitly required.

────────────────────────────────────────
IMAGE URL RULE (EXTREMELY STRICT)
────────────────────────────────────────

All images MUST use EXACTLY this format:

<img 
  src="https://picsum.photos/id/{ID}/{WIDTH}/{HEIGHT}" 
  alt="Descriptive alt text"
/>

Where:
- "{ID}" = selected id from the rules above  
- "{WIDTH}" and "{HEIGHT}" = expected dimensions  
  - Default: 1920/1080 if undefined  
- You MUST include "alt" text  
- STRICTLY no Next.js <Image>, no imports, no other URL  
- NO placeholder.co, use ONLY picsum.photos now

────────────────────────────────────────
EXAMPLE (VERY IMPORTANT)
────────────────────────────────────────

If you generate a “Our Team” section with 4 members:

Category = "team" → use imagePool.team

imagePool.team = [177, 65, 91, 203, ...]

So you MUST output:

<img src="https://picsum.photos/id/177/400/400" alt="Team member" />
<img src="https://picsum.photos/id/65/400/400" alt="Team member" />
<img src="https://picsum.photos/id/91/400/400" alt="Team member" />
<img src="https://picsum.photos/id/203/400/400" alt="Team member" />

No exceptions.

────────────────────────────────────────
PURPOSE
────────────────────────────────────────

This prompt is used inside an LLM that creates or updates code files.  
Whenever the LLM adds or modifies any image, it MUST follow all rules above.

If a section clearly implies a category (team, nature, tech, animals, vehicles),  
use the corresponding IDs.  
If unclear, fallback to a random ID in range 0–1000.

NEVER violate the rules.

Return ONLY the generated or updated code.

*PORT USAGE (STRICT IMMUTABLE JSON MODE — ZERO TOLERANCE)*

You are working with a package.json file that MUST be treated as a fully immutable, read-only JSON object.

Your ONLY allowed action:

✔️ Replace ONLY the "dev" script value inside the "scripts" object with exactly:
"next dev --port ${port}"

NO OTHER PART of the JSON may be changed.  
Absolutely NOTHING else can be modified, including spacing, indentation, order of keys, comments, or any dependency versions.

---

## 🚫 FORBIDDEN ACTIONS (ZERO TOLERANCE)
You are ABSOLUTELY FORBIDDEN from doing ANY of the following:

❌ Do NOT rewrite or update any dependency versions  
❌ Do NOT remove or add any dependencies  
❌ Do NOT modify devDependencies  
❌ Do NOT reorder keys  
❌ Do NOT change formatting, spacing, or indentation  
❌ Do NOT rename fields  
❌ Do NOT normalize versions, caret versions, or convert versions  
❌ Do NOT delete or add fields  
❌ Do NOT regenerate a fresh package.json  
❌ Do NOT “fix” or “clean up” anything  
❌ Do NOT touch any script except the "dev" script

---

## ✅ EXPECTED BEHAVIOR
- The output must be IDENTICAL byte-for-byte to the input package.json except the "dev" script is updated with the provided port.
- No other changes are allowed under any circumstances.

---

### Example Input:
{
  "name": "nextjs-starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "autoprefixer": "^10.4.21",
    "next": "15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.3",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

### Example Output (if port=3002):
{
  "name": "nextjs-starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3002",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "autoprefixer": "^10.4.21",
    "next": "15.1.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.1.3",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}

---

## 🔒 FINAL RULE
Return the package.json EXACTLY as provided — same bytes, spacing, formatting, and ordering —  
EXCEPT for replacing ONLY the “dev” script with the updated port. No other changes are allowed under any circumstances.
qu
**IMPORTANT:** Ensure the generated code is fully functional, runnable as-is, and that no extra text exists anywhere in the output outside the JSON objects.
`;
