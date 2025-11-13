import type { TreeNode } from "@/components/builder/tree-view-component";
import { globalStore } from "@/store/global.store";
import { WebContainerClass } from "@/webcontainer/webcontainer";
import type {
  DirectoryNode,
  FileSystemTree,
  WebContainer,
} from "@webcontainer/api";
import { writeFileSync } from "fs";

export type fileTreeStructure = TreeNode & { path?: string };

const structuredFiles: FileSystemTree = {};

export const trimPath = (path: string) =>
  path.split("/").filter((e) => e.trim());

export function convertFiles(object: Record<string, string>) {
  Object.entries(object).forEach((str) => {
    const [filePath, fileContent] = str;
    const filteredPath = trimPath(filePath);
    let objectRef = structuredFiles;

    filteredPath.forEach((path, idx) => {
      let currentNode = (objectRef[path] ?? { directory: {} }) as DirectoryNode;

      if (idx === filteredPath.length - 1) {
        objectRef[path] = {
          file: {
            contents: fileContent,
          },
        };

        return;
      }

      objectRef[path] = currentNode;
      objectRef = currentNode.directory;
    });
  });

  return structuredFiles;
}

let fileSystemTree: fileTreeStructure[] = [];

export function convertFilesToTree(files: any[]) {
  files.forEach((file) => {
    const { file_path } = file as Record<string, string>;

    const pathSegments = file_path!
      .split("/")
      .filter((segment) => segment.trim());

    let currentLevel = fileSystemTree;
    let currentPath = "";

    pathSegments.forEach((segment, idx) => {
      currentPath += `/${segment}`;

      if (idx === pathSegments.length - 1) {
        const fileNode = {
          id: crypto.randomUUID(),
          label: segment,
          type: "file" as "dir" | "file",
          path: currentPath,
        };
        currentLevel.push(fileNode);
        return;
      }

      const directoryNode = {
        id: crypto.randomUUID(),
        label: segment,
        type: "dir" as "dir" | "file",
        path: currentPath,
        children: [],
      };

      const existingNode = currentLevel.find(
        (child) => child.label === directoryNode.label,
      );

      if (!existingNode) currentLevel.push(directoryNode);
      currentLevel = existingNode?.children ?? directoryNode.children;
    });
  });

  return fileSystemTree;
}

export function findSiblingNodes(
  targetPath: string,
  fileTree: fileTreeStructure[],
) {
  const pathSegments = trimPath(targetPath);
  let currentLevel: fileTreeStructure[] = fileTree;
  let accumulatedPath = "";

  return pathSegments
    .map((segment) => {
      if (!currentLevel.length) return;

      accumulatedPath += `/${segment}`;

      const isSrcPath = targetPath === "/src";

      const currentNode = currentLevel.find(
        (node) => node.path === accumulatedPath,
      );

      if (!isSrcPath && currentNode?.children)
        currentLevel = currentNode?.children ?? [];

      const isTargetChild = currentLevel.find(
        (child: fileTreeStructure) => child?.path === targetPath,
      );

      if (isTargetChild) {
        const siblingNodes = currentLevel.filter(
          (child: fileTreeStructure) => child?.path !== targetPath,
        );

        currentLevel = [];
        return siblingNodes;
      }

      currentLevel = currentNode?.children ?? [];
    })
    .filter(Boolean)
    .at(0);
}

export async function installDeps() {
  try {
    console.log("installing deps");
    const wc = await WebContainerClass.getWebContainer();
    const installProcess = await wc.spawn("npm", ["i"]);
    const iframeEl = document.querySelector("#iframeEL") as HTMLIFrameElement;

    if (!iframeEl) {
      console.error("iframeEl not found");
      return;
    }

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log("installing deps", data);
        },
      }),
    );

    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error("Unable to run npm install");
    }

    const devProces = await wc.spawn("npm", ["run", "dev"]);

    devProces.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log("start dev server");
          console.log("dev server", data);
        },
      }),
    );

    wc.on("server-ready", (_, url) => {
      console.log("feeding url in iframeEL");
      iframeEl.src = url;
      globalStore.isPreviewLoading = false;
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to install deps", error);
    return { success: false };
  }
}

export async function mountTemplateFilesInWebContainer(files: FileSystemTree) {
  try {
    console.log("setting up container");
    const wc = await WebContainerClass.getWebContainer();
    console.log("mounting files");
    await wc.mount(files);
  } catch (error) {
    console.error("Failed to insert files inside wc", error);
  }
}

async function ensureDirectoryExists(
  dirPath: string,
  webcontainer: WebContainer,
) {
  try {
    console.log("Checking or creating directory:", dirPath);
    await webcontainer.fs.readdir(dirPath);
    return { success: true };
  } catch {
    await webcontainer.fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  }
}

export async function writeFileToContainer(
  filePath: string,
  fileContent: string,
) {
  try {
    const webcontainer = await WebContainerClass.getWebContainer();
    await webcontainer.fs.writeFile(filePath, fileContent);
  } catch (error) {
    console.error("Failed to write file:", filePath, error);
  }
}

export async function updateContainerFiles(
  files: Record<string, string>[],
  projectFiles: Record<string, string>[],
) {
  try {
    const webcontainer = await WebContainerClass.getWebContainer();

    const insertionPromise = files.map(async (object) => {
      const { file_path, file_content } = object;

      if (!file_path || !file_content) {
        console.error(
          "file path or content not found",
          file_path,
          file_content,
        );
        return;
      }

      const pathSegments = trimPath(file_path);
      const folderSegments = pathSegments.slice(0, -1);

      if (!folderSegments.length) {
        console.log("Writing root file:", file_path);
        await writeFileToContainer(file_path, file_content);
        return;
      }

      const folderPath = `/${folderSegments.join("/")}`;
      const result = await ensureDirectoryExists(folderPath, webcontainer);

      if (result.success) {
        await writeFileToContainer(file_path, file_content);
        console.log("File written:", file_path);
      }
    });

    await Promise.all(insertionPromise);
    console.log("creating files structure");
    return convertFilesToTree(projectFiles);
  } catch (error) {
    console.error("Failed to update container files", error);
  }
}

export function extractCodeContent(code: Record<string, string>[]) {
  return code
    .map((c) => {
      const { file_content, file_path } = c;

      if (!file_content || !file_path) {
        console.error("file path or content not found");
        return null;
      }

      const regex = /<coderocketFile[^>]*>([\s\S]*?)<\/coderocketFile>/;
      const match = file_content.match(regex);

      const object = {
        file_path,
      } as Record<string, string>;

      if (match && match[1]) {
        const updatedContent = match[1];
        object["file_content"] = updatedContent.trim();
      } else {
        console.log(`failed to get content for path`, file_path);
        object["file_content"] = "file content doesnt matched";
      }

      return object;
    })
    .filter((content): content is Record<string, string> => !!content);
}
