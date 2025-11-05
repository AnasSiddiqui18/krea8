import type { TreeNode } from "@/components/builder/tree-view-component";
import { WebContainerClass } from "@/webcontainer/webcontainer";
import type { DirectoryNode, FileSystemTree } from "@webcontainer/api";

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

export function convertFilesToTree(filePaths: Record<string, string>) {
  Object.entries(filePaths).forEach(([filePath]) => {
    const pathSegments = filePath
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

export async function setupWebContainer(files: FileSystemTree) {
  try {
    console.log("setting up container");

    const wc = await WebContainerClass.getWebContainer();
    const iframeEl = document.querySelector("#iframeEL") as HTMLIFrameElement;

    console.log("mounting files");

    wc.mount(files);

    console.log("installing deps");

    const installProcess = await wc.spawn("npm", ["install"]);

    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error("Unable to run npm install");
    }

    wc.on("server-ready", (_, url) => {
      console.log("webcontainer url", url);
      iframeEl.src = url;
    });

    console.log("starting dev server");

    const devProcess = await wc.spawn("npm", ["run", "dev"]);

    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data);
        },
      }),
    );
  } catch (error) {
    console.error("Webcontainer setup failed", error);
  }
}
