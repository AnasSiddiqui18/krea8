import z from "zod"

export const fragmentSchema = z.object({
    sandboxId: z
        .string()
        .describe(
            "A unique sandbox identifier generated at the start of the website creation process. The client must store this value to track the sandbox state and interact with its runtime environment.",
        ),

    fileBlocks: z.array(
        z.object({
            rawFileBlock: z.string().describe(
                `Actual code content of the corresponding file, wrapped in a <krea8file> tag.

        The <krea8file> tag MUST include:
        - path: full file path
        - name: name of the file
        - action: either "creating" or "updating"

        The content inside the tag MUST be the full file content.

        Examples:

        1) Creating a new component file:

        <krea8file path="src/components/Button.tsx" action="creating" name="Button.tsx">
        import React from "react";

        type ButtonProps = {
          label: string;
          onClick?: () => void;
        };

        export const Button = ({ label, onClick }: ButtonProps) => {
          return (
            <button onClick={onClick}>
              {label}
            </button>
          );
        };
        </krea8file>

        2) Updating an existing file:

        <krea8file path="src/components/Button.tsx" action="updating">
        import React from "react";

        type ButtonProps = {
          label: string;
          onClick?: () => void;
          disabled?: boolean;
        };

        export const Button = ({ label, onClick, disabled }: ButtonProps) => {
          return (
            <button onClick={onClick} disabled={disabled}>
              {label}
            </button>
          );
        };
        </krea8file>

        Rules:
        - Always wrap code inside a single <krea8file> tag
        - Do not include explanations outside the tag
        - Use action="creating" only if the file does not exist
        - Use action="updating" only if the file already exists
        `,
            ),
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

export const websiteUpdatePlanSchema = z.object({
    actionFiles: z
        .array(
            z.object({
                action: z
                    .literal(["update", "create", "delete"])
                    .describe(
                        "Action to perform on the file. 'update' = modify existing, 'create' = add new, 'delete' = remove",
                    ),
                path: z
                    .string()
                    .describe(
                        "Exact file path inside the project. For 'update' or 'delete', path must exist. For 'create', path must be valid and new.",
                    ),
            }),
        )
        .describe("Array of files that need to be created, updated, or deleted based on the user's request"),

    referencedFiles: z
        .array(
            z.object({
                path: z.string().describe("File path that is only provided for reference. Cannot be modified."),
            }),
        )
        .describe(
            "Array of read-only files that the second LLM can reference when generating updates. Can be empty if no reference is needed.",
        ),
})

export const websiteUpdateSchema = z.object({
    fileBlocks: z
        .array(
            z.object({
                rawFileBlock: z.string().describe(
                    `
Actual code content of an EXISTING file, wrapped in a <krea8file> tag.

This schema is used ONLY for updating an already existing website.
The LLM MUST NOT create new files.

The <krea8file> tag MUST include:
- path: full file path of an EXISTING file
- name: name of the file
- action: MUST be "updating" (creation is NOT allowed)

The content inside the tag MUST be the FULL updated file content
(not a diff, not a patch, not a partial snippet).

Example:

<krea8file path="src/components/Button.tsx" action="updating" name="Button.tsx">
import React from "react";

type ButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

export const Button = ({ label, onClick, disabled }: ButtonProps) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};
</krea8file>

Rules:
- Only EXISTING files may be referenced
- action MUST always be "updating"
- Do NOT use action="creating"
- Do NOT introduce new file paths
- Always wrap the full updated code in a single <krea8file> tag
- Do not include explanations or text outside the tag
`,
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
