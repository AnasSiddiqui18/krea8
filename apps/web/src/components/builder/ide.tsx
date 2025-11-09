import { TreeView } from "./tree-view-component";
import { CodeEditor } from "../editor/code-editor";
import { useSnapshot } from "@/hooks/use-snapshot";
import { globalStore } from "@/store/global.store";
import { findSiblingNodes, trimPath } from "@/shared/shared";
import { WebContainerClass } from "@/webcontainer/webcontainer";
import type { fileTreeStructure } from "@/shared/shared";
import { cn } from "@repo/ui/lib/utils";
import { FilePathSelector } from "./file-path-selector";
import { useMemo } from "react";
import { Breadcrumb, BreadcrumbList } from "@repo/ui/components/breadcrumb";

type IDEProps = React.ComponentProps<"div">;

export function IDE({ className, ...props }: IDEProps) {
  const { fileTree, template, selectedFile } = useSnapshot(globalStore);

  async function handleSelectFile(file: fileTreeStructure) {
    if (file.type !== "file" || !file.path) {
      console.log("if runs", file.type, file.path, template?.slice(0, 5));
      return;
    }

    const code = (await WebContainerClass.getFiles(file.path)) as string;

    console.log("selecting file");

    globalStore.selectedFile = { code: code, path: file.path };
  }

  const path = useMemo(() => {
    if (!selectedFile.path) return;

    const originalPath = trimPath(selectedFile.path);

    let accumulativePath = "";

    const structuredFiles = originalPath.map((path) => {
      accumulativePath += `/${path}`;
      const siblings = findSiblingNodes(accumulativePath, fileTree);

      return {
        label: path,
        path: accumulativePath,
        siblings,
      };
    });

    return structuredFiles;
  }, [selectedFile.path]);

  return (
    <div className={cn("h-full flex w-full", className)} {...props}>
      <div className="w-[300px] border border-secondary-foreground/10 h-9">
        {fileTree.length ? (
          <TreeView data={fileTree} onNodeClick={handleSelectFile} />
        ) : undefined}
      </div>

      <div className="w-full h-full relative flex flex-col">
        <div className="w-full h-9 border border-secondary-foreground/10 z-10 bg-background text-muted-foreground items-center px-3 flex text-sm">
          <Breadcrumb>
            <BreadcrumbList>
              {path &&
                path.map((p, idx) => {
                  return (
                    <FilePathSelector
                      key={p.label}
                      label={p.label}
                      siblings={p.siblings ?? []}
                      handleSelectFile={handleSelectFile}
                      showSeparator={idx !== path.length - 1 ? true : false}
                    />
                  );
                })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <CodeEditor />
      </div>
    </div>
  );
}
