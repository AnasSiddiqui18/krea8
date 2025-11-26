import fs from "fs";
import path from "path";
import { getPort } from "get-port-please";

const getFoldersPath = (filePath: string) => {
  const segments = filePath.split("/").filter(Boolean);
  return segments.slice(0, -1).join("/");
};

const getSbxRoot = (sbxId: string) => `./sandboxes/sandbox-${sbxId}`;

export async function createFolderTree(
  sbxId: string,
  files: Record<string, string>,
) {
  try {
    const sandboxRoot = getSbxRoot(sbxId);

    fs.mkdirSync(sandboxRoot, { recursive: true });

    for (let [filePath, content] of Object.entries(files)) {
      filePath = filePath.replace(/^\//, "");

      const folderPath = getFoldersPath(filePath);
      if (folderPath) {
        fs.mkdirSync(path.join(sandboxRoot, folderPath), { recursive: true });
      }

      fs.writeFileSync(path.join(sandboxRoot, filePath), content);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to create sandbox folder tree:", error);
    return { success: false };
  }
}

export async function getFile(filePath: string, sbxId: string) {
  try {
    const sandboxRoot = getSbxRoot(sbxId);

    const updatedFilePath = filePath.replace(/^\//, "");

    const fileContent = fs.readFileSync(
      path.join(sandboxRoot, updatedFilePath),
      "utf-8",
    );

    return {
      success: true,
      file: fileContent,
    };
  } catch (error) {
    console.log("Failed to read file", filePath);
    return {
      success: false,
      file: null,
    };
  }
}

export async function getAvailablePort() {
  try {
    const port = await getPort();
    return {
      success: true as const,
      data: port,
    };
  } catch (error) {
    console.log("Failed to get port", error);

    return {
      success: false as const,
      data: null,
    };
  }
}

export async function updateFile(
  filePath: string,
  updatedContent: string,
  sbxId: string,
) {
  try {
    const root = getSbxRoot(sbxId);
    const fullPath = path.join(root, filePath);
    fs.writeFileSync(fullPath, updatedContent);
    return { success: true, message: "file updated" };
  } catch (error) {
    return { success: false, message: "failed to update" };
  }
}
