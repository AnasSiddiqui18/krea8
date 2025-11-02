import { WebContainerClass } from "@/webcontainer/webcontainer";
import type { DirectoryNode, FileSystemTree } from "@webcontainer/api";

const structuredFiles: FileSystemTree = {};

export function convertFiles(object: Record<string, string>) {
  Object.entries(object).forEach((str) => {
    const [filePath, fileContent] = str;
    const filteredPath = filePath.split("/").filter((p) => p.trim());
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
