import z from "zod"

export const promptSchema = z.object({ prompt: z.string().min(5, { message: "Prompt must be of 5 chars max" }) })

export const fragmentSchema = z.object({
    sandboxId: z
        .string()
        .describe(
            "A unique sandbox identifier generated at the start of the website creation process. The client must store this value to track the sandbox state and interact with its runtime environment.",
        ),
    code: z.array(
        z.object({
            action: z.enum(["creating", "updating"]).describe(`
        Specifies the type of file operation being performed.
        
        - **"creating"** → A new file is being added to the project (e.g., \`src/components/Button.tsx\` if it didn't exist before).
        - **"updating"** → An existing file in the project is being modified or overwritten (e.g., \`src/app/page.tsx\` if it already exists).
        
        This field helps distinguish between files that are newly generated and those that are modified as part of an update process.
          `),
            file_name: z.string().describe("Name of the file."),
            file_path: z.string().describe("Relative path to the file, including the file name."),
            file_content: z
                .string()
                .describe("actual code content of the corresponding file, wrapped in a coderocketFile tag"),
        }),
    ),
    completion_message: z.string().describe(`
  A short, professional completion message (1–2 sentences) displayed to the user once the project generation process is finished.

  The message must:
  - Explicitly mention the **project name or type** (e.g., "Todo App", "Portfolio Website", "Chat Application").
  - Briefly describe the **main functionality or benefit** of the generated project.
  - Clearly state that the **WebContainer or preview environment is still being set up**, and that it will be available shortly.
  - Maintain a **neutral and professional tone** — do not use emojis, exclamation marks, or overly casual expressions.
  - Do not use phrases like "successfully generated" or "you can now start using" — instead, describe the current state and next step.

  Examples:
  - "The Todo App has been generated. It helps you manage daily tasks efficiently. The WebContainer is now initializing and will be ready for preview soon."
  - "Your Portfolio Website has been generated to showcase your work professionally. The WebContainer is currently setting up and will be accessible shortly."
  - "The Blog Platform has been generated to help you publish and organize content. The preview environment is in progress and will start automatically once ready."
`),
})

export const websiteUpdateSchema = z.object({
    code: z
        .array(
            z.object({
                action: z.literal(["update", "create", "delete"]).describe("Action: create, update, or delete"),
                path: z.string().describe("File path"),
                updatedContent: z
                    .string()
                    .describe(
                        "The final runnable code of the file, wrapped in <coderocketFile>...</coderocketFile> tags",
                    ),
            }),
        )
        .describe("An array containing multiple files on which actions need to be performed"),

    outro_message: z
        .string()
        .describe(
            "A short closing sentence AFTER all code changes. This must clearly state that the requested modifications have been completed and delivered.",
        ),
})

// sandbox schemas

export const sandboxCreateSchema = z.union([
    z.object({ success: z.literal(false), message: z.string(), sbxId: z.null() }),
    z.object({
        success: z.literal(true),
        message: z.string(),
        sbxId: z.string(),
    }),
])

export const getSandboxCreationStatusSchema = z.object({
    status: z.enum(["completed", "failed", "progress"]),
    server_url: z.union([z.string(), z.null()]),
    message: z.string(),
})

export const getFilesFromSandboxSchema = z.union([
    z.object({ message: z.string(), file: z.null(), success: z.literal(false) }),
    z.object({ message: z.string(), file: z.string(), success: z.literal(true) }),
])

export const updateFileInSandboxSchema = z.object({
    success: z.boolean(),
    message: z.string(),
})
