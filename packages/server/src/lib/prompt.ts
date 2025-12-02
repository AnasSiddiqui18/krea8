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

export const generateWebsitePrompt = (
  userPrompt: string,
  port: string,
  initialTemplate: Record<string, string>,
) => `
You are a professional code generator AI. Your task is to generate or update files for a Next.js 15.1.3 project using the following starter template:


Template

$${initialTemplate}

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


"Icon Usage:

Ensure that whenever generating any website or UI code, all icons must always come from the 'lucide-react' library only.

1 - Do not use any other icon library.
2 - Always import icons using the pattern: import { Home, Search, Menu } from 'lucide-react';

Example usage for the model:

import { Home, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className='flex items-center gap-4 p-4'>
      <Home className='w-5 h-5' />
      <span className='text-xl font-semibold'>Dashboard</span>
      <Search className='w-5 h-5 ml-auto' />
    </nav>
  );
}"


*PORT USAGE (STRICT IMMUTABLE JSON MODE — ZERO TOLERANCE)*

You are working with a package.json file that MUST be treated as a fully immutable, read-only JSON object.

Your ONLY allowed action:

✔️ Replace ONLY the "dev" script value inside the "scripts" object with exactly:
"next dev --port ${port}"

NO OTHER PART of the JSON should be modified.
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

### Example Input (something which is defined inside template package.json file):
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
    "lucide-react": "^0.548.0",
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

### Example Output (Literally same package.json file just the ${port} has been updated in the dev script):
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
    "lucide-react": "^0.548.0",
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

## 🔒 FINAL RULE

Return the package.json EXACTLY as provided — same bytes, spacing, formatting, same dependencies, same dependencies versions and ordering —  
EXCEPT for replacing ONLY the “dev” script with the updated port. No other changes are allowed under any circumstances.

**IMPORTANT:** Ensure the generated code is fully functional, runnable as-is, and that no extra text exists anywhere in the output outside the JSON objects.
`;

export const generateWebsiteUpdatePlanPrompt = (
  projectFiles: Record<string, string>,
  userPrompt: string,
) => `
You are an expert codebase analysis system. You will receive:

1. The entire project file map (key = file path, value = file contents)
2. A user request describing a change to the website

Your task is to generate a **modification plan** describing exactly which files must be:
- updated
- created
- deleted

Additionally, determine if any **existing files need to be referenced** (for context) by the second LLM, without modifying them.

---

Your output MUST conform exactly to this structure:

{
  "actionFiles": [
    {
      "name": string,       // Human-readable identifier, e.g., "Navbar", "Landing Page"
      "action": "update" | "create" | "delete",
      "path": string        // Exact project path for update/create/delete
    }
  ],
  "referencedFiles": [
    {
      "path": string,       // File path for reference only
    }
  ]
}

---

CRITICAL RULES:

1. Only include files **directly needed** for the requested update in 'actionFiles'.
2. Include only **necessary reference files** in 'referencedFiles'; these are **read-only**.
3. For 'update' actions, the file **must exist** in the projectFiles. For 'create', it **must not exist yet**. For 'delete', only if explicitly requested.
4. Do not include unrelated files (package.json, tsconfig.json, tailwind.config.ts, etc.).
5. **Do not generate or change file contents** in this step — planning only.
6. If no reference files are needed, 'referencedFiles' should be an empty array: [].
7. Return **ONLY JSON**, no explanations, no extra text.

---

EXAMPLES:

**Example 1: Add a footer**

User request: "Please create a footer component and place it at the last of the landing page structure, the footer will be fairly simple using the same logo as the Navbar."

Output:
{
  "actionFiles": [
    {
      "name": "Footer",
      "action": "create",
      "path": "src/components/Footer.tsx" 
    },
    {
      "name": "Landing Page",
      "action": "update",
      "path": "src/app/page.tsx"
    }
  ],
  "referencedFiles": [
    {
      "path": "src/components/Navbar.tsx",
    }
  ]
}

**Example 2: Update navbar links**

User request: "Add a new link 'Blog' to the Navbar component."

Output:
{
  "actionFiles": [
    {
      "name": "Navbar",
      "action": "update",
      "path": "src/components/Navbar.tsx"
    }
  ],
  "referencedFiles": []
}

**Example 3: Delete a component**

User request: "Remove the old 'Testimonials' component from the page."

Output:
{
  "actionFiles": [
    {
      "name": "Testimonials",
      "action": "delete",
      "path": "src/components/Testimonials.tsx"
    },
    {
      "name": "Landing Page",
      "action": "update",
      "path": "src/app/page.tsx"
    }
  ],
  "referencedFiles": []
}

---

PROJECT FILES:

${JSON.stringify(projectFiles, null, 2)}

USER REQUEST:

"${userPrompt}"

---

Return the JSON object with 'actionFiles' and 'referencedFiles'.
`;

// export const updateWebsitePrompt = (
//   structure: Record<string, any[]>,
//   userPrompt: string,
// ) => `
// You are an expert code generator with STRICT RULES.  Read this entire prompt before generating anything.

// You will receive a single JSON object called **structure** plus a plain **user prompt** describing what the user wants changed. The **structure** object contains two arrays:

// - 'actionFiles[]' — list of files the LLM MUST produce output for. Each object contains:
//   - 'action': '"create" | "update" | "delete"'
//   - 'path': exact path to operate on
//   - optionally 'content': the current file content (only present for update actions or when included by the caller). **If provided, use this 'content' as the exact starting point for any "update".**

// - 'referencedFiles[]' — authoritative, read-only files that are the ONLY sources of truth for visual structure, JSX patterns, classNames, brand elements, imports, and naming conventions. Each object contains:
//   - 'path': path of the reference file
//   - 'content': full file content — you MUST parse and reuse exact snippets from here when the user asks to reuse elements.

// GOAL
// Given:
// - the 'userPrompt' (plain text) describing the requested change, and
// - the 'structure' object with 'actionFiles and 'referencedFiles,

// produce **only** a JSON array of file actions (one item per 'actionFiles' entry) describing the files after changes. Follow the ABSOLUTE RULES below.

// 🔥 ABSOLUTE RULES (NO EXCEPTIONS)
// 1. **ONLY output a JSON array.** Nothing else. No commentary, no extra fields, no code fences, no markdown. If the user supplied 'actionFiles' with N entries, you must return exactly N objects in the array — one per action file — in the same order.

// 2. **Each array item must be exactly:**
//    {
//      "action": "create" | "update" | "delete",
//      "path": "<exact path>",
//      "updatedContent": "<coderocketFile>...file content here...</coderocketFile>"
//    }
//    - 'action' and 'path' must match the corresponding 'actionFiles' entry.
//    - 'updatedContent' must be a string whose entire content is wrapped inside '<coderocketFile>...</coderocketFile>'.

// 3. **For 'create' and 'update': 'updatedContent' must contain the full file content to be created/after update.** For 'delete': 'updatedContent' must be an empty '<coderocketFile></coderocketFile>'.

// 4. **You MUST NOT invent or assume anything not present in the input.** That includes:
//    - New images, icon files, logo files, CSS files, asset filenames, or new images/paths.
//    - New imports unless they are absolutely required and you can reuse them from 'referencedFiles' (i.e., they already exist in references).
//    - New top-level JSX patterns or brand names not present in referencedFiles.
//    If the user requests something that would require an asset or element that does not exist in 'referencedFiles', prefer a textual/substituted implementation (for example reuse the same text logo JSX if there is no image logo) and **do not create imaginary assets**.

// 5. **When the user asks to reuse elements from a referenced file (e.g., “same logo as Navbar”):**
//    - Extract the **exact** JSX/text/className/import lines from the referenced file's 'content' and place them verbatim in the new/updated file.
//    - Do not wrap, replace, or alter the extracted snippet (except to adjust variable names only when required and explicitly safe — prefer not to rename).
//    - If an exact match does not exist, choose the closest exact match from 'referencedFiles'. Do not invent.

// 6. **When updating a file:**
//     - You MUST keep the entire original file structure EXACTLY as provided in actionFiles[].content.
//     - You are never allowed to rewrite or replace unrelated sections of the file.
//     - You may ONLY insert, remove, or modify the specific lines required by the userPrompt.
//     - You MUST preserve all imports, JSX structure, components, layout, and styling that already exist.
//     - If the user asks to "place something at the bottom", you must locate the correct insertion point in the existing JSX and insert it there without rewriting the rest.
//     - ANY rewrite of the component structure beyond the requested change is strictly forbidden.

// 7. **When creating a file:**
//    - Use referencedFiles as the style guide: copy Tailwind class patterns, semantic HTML, JSX conventions, and naming.
//    - If the user asks to “use the same logo as Navbar,” and the Navbar's code contains a text-based logo, reuse that exact block.
//    - New code must be minimal: only add what the user explicitly requested and what is necessary to integrate with the updated files in 'actionFiles'.
//    - Never create unknown assets; use text or existing referenced assets instead.

// 8. **For any behavior that could hallucinate (uncertain names/paths/content): choose safe, deterministic behavior:**
//    - If multiple referenced matches exist, choose the one that is the closest exact match.
//    - If imports or symbols are ambiguous, prefer to reuse imports exactly as they are in referenced files.
//    - If you cannot satisfy the user's request without inventing assets, do the closest valid alternative using only existing assets/referenced structures.

// 9. **Output file content must be valid and consistent** with the project's conventions seen in 'referencedFiles' (e.g., Next.js 'Link' usage, Tailwind patterns, export default functions/components, etc.)

// 10. **DO NOT add or remove items from 'actionFiles' — produce outputs only for the listed paths.** The caller will handle applying these results.

// SPECIAL ANTI-HALLUCINATION RULES (examples)
// - If 'Navbar.tsx' contains:
//   <div className="text-2xl font-bold text-blue-600">
//     <Link href="/">MyWebsite</Link>
//   </div>
//   and the user says “use the same logo as Navbar”, then **the new file must include this identical block** (character-for-character).

// - If the user asks “place the footer at the last of the landing page structure,” and the 'actionFiles' contains an 'update' for 'src/app/page.tsx' with its current content, you must:
//   - Use that provided 'content' as the base,
//   - Import the created Footer (if 'Footer' is a 'create' action in the same 'actionFiles' array) using the exact path used in the 'create' action,
//   - Insert '<Footer />' at the requested location (for example at the end of the main content before the closing tag), and
//   - Return the full updated file content in 'updatedContent'.

// IMPLEMENTATION DETAILS YOU MUST FOLLOW
// - Treat 'referencedFiles[].content' as authoritative; parse it when extracting snippets.
// - If 'actionFiles[].content' exists, it is the authoritative base for updates of that file.
// - Add only the imports that are already present in 'referencedFiles' or that correspond to components you are creating in the same 'actionFiles' payload.
// - Always wrap file contents inside '<coderocketFile>...</coderocketFile>' exactly (no extra whitespace outside tags). For deleted files return '<coderocketFile></coderocketFile>'.

// REQUIRED OUTPUT FORMAT (again — exact)
// Return a JSON array like:
// [
//   {
//     "action": "update" | "create" | "delete",
//     "path": "src/whatever/Here.tsx",
//     "updatedContent": "<coderocketFile>...full file content here...</coderocketFile>"
//   }
// ]

// NO explanations.
// NO comments.
// NO extra text.

// USER PROMPT:
// "${userPrompt}"

// STRUCTURE (stringified JSON):
// "${structure}"

// Now generate the array of file objects following all rules above.

// `;

export const updateWebsitePrompt = (
  structure: Record<string, string>,
  userPrompt: string,
) => `
  You are an expert Next.js AI developer. You will receive:

  1. A Next.js project structure as an object where keys are file paths and values are file contents:
  ${JSON.stringify(structure, null, 2)}

  2. A user request describing modifications to the project:
  "${userPrompt}"

  Your task:

  - Understand the user's request fully.
  - Decide which files need to be UPDATED or CREATED.
  - NEVER modify configuration files. These are STRICTLY READ-ONLY:
    - package.json
    - tsconfig.json
    - next.config.js / next.config.mjs
    - tailwind.config.js / tailwind.config.ts
    - postcss.config.js
    - eslint config files
  - Only update project source files or create new files if required by the user's request.
  - **Do not remove or overwrite existing code in any file unless explicitly instructed.**
  - If a new component is created or an existing component is updated, **update only the src/app/page.tsx file** to include it.
  - Do NOT modify layout.tsx or any other parent files; every new component must be added only to page.tsx.
  - Insert new components at the position requested by the user, or if unspecified, **append after the last existing JSX element in page.tsx**.
  - All updated or created files must be plug-and-play: imports, types, hooks, and functionality must work correctly.

  Response Format:

  - Return ONLY a JSON array.
  - Each item in the array must be an object where the key is the file path, and the value is the full updated or newly created file content.
  - Only return files that were modified or created.

  Examples:

  Example 1 – Creating a new Footer and updating page.tsx without removing existing content:
  User Request: "Add a footer component to the landing page."

  Current src/app/page.tsx file:
  \`\`\`tsx
  export default function Page() {
    return (
      <main>
        <h1>Welcome to our site</h1>
        <HeroSection />
      </main>
    );
  }
  \`\`\`

  Response:
  {
    "code": [
      {
        "src/components/Footer.tsx": "import React from 'react';\\n\\nexport default function Footer() {\\n  return (<footer>\\n    <p>© 2025 Company Name</p>\\n    <a href='/about'>About</a>\\n    <a href='/contact'>Contact</a>\\n  </footer>);\\n}"
      },
      {
        "src/app/page.tsx": "import React from 'react';\\nimport HeroSection from '../components/HeroSection';\\nimport Footer from '../components/Footer';\\n\\nexport default function Page() {\\n  return (<main>\\n    <h1>Welcome to our site</h1>\\n    <HeroSection />\\n    <Footer />\\n  </main>);\\n}"
      }
    ]
  }

  Example 2 – Updating Navbar:
  User Request: "Add a new navigation link 'Pricing' in the Navbar."

  Response:
  {
    "code": [      
        {
          "src/components/Navbar.tsx": "import React from 'react';\\n\\nexport default function Navbar() {\\n  return (<nav>\\n    <a href='/home'>Home</a>\\n    <a href='/about'>About</a>\\n    <a href='/pricing'>Pricing</a>\\n  </nav>);\\n}"
        },
        {
          "src/app/page.tsx": "import React from 'react';\\nimport Navbar from '../components/Navbar';\\n\\nexport default function Page() {\\n  return (<main>\\n    <Navbar />\\n  </main>);\\n}"
        }      
    ]
  }

  Rules:

  1. Do not include explanations or Markdown in the response.
  2. Do not modify config files or unrelated files.
  3. Preserve all existing code unless explicitly instructed to remove it.
  4. Always ensure code is valid, functional, and plug-and-play.
  5. Always include required imports, hooks, and types.
  6. Automatically update src/app/page.tsx whenever a new component is created or an existing component is updated. **Never update layout.tsx or other files.**
  7. Insert new components at the position requested by the user, or append if unspecified.
  8. The response must be directly parseable with JSON.parse.
  9. Only return files that were modified or created.

  Now, consider the project structure and the user's request, and output the updated or newly created files exactly as they should exist in the project, updating only page.tsx for parent integration.
`;
