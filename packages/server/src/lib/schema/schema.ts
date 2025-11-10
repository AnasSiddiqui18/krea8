import z from "zod";

export const fragmentSchema = z.object({
  
  code: z.array(
    z.object({
      action: z.enum(["creating", "updating"]).describe(`
        Specifies the type of file operation being performed.
        
        - **"creating"** → A new file is being added to the project (e.g., \`src/components/Button.tsx\` if it didn't exist before).
        - **"updating"** → An existing file in the project is being modified or overwritten (e.g., \`src/app/page.tsx\` if it already exists).
        
        This field helps distinguish between files that are newly generated and those that are modified as part of an update process.
          `),
      file_name: z.string().describe("Name of the file."),
      file_path: z
        .string()
        .describe("Relative path to the file, including the file name."),
      file_content: z.string().describe("Content of the file."),
    }),
  ),
});
