import { TreeView } from "./tree-view-component";
import { CodeEditor } from "../editor/code-editor";
import { useSnapshot } from "@/hooks/use-snapshot";
import { globalStore } from "@/store/global.store";
import { WebContainerClass } from "@/webcontainer/webcontainer";
import { useState } from "react";
import type { fileTreeStructure } from "@/shared/shared";
import { cn } from "@repo/ui/lib/utils";

type IDEProps = React.ComponentProps<"div">;

export function IDE({ className, ...props }: IDEProps) {
  const { fileTree } = useSnapshot(globalStore);
  const [selectedFile, setSelectedFile] = useState("");

  async function handleSelectFile(e: fileTreeStructure) {
    if (e.type !== "file" || !e.path) return;
    const file = (await WebContainerClass.getFiles(e.path)) as string;
    setSelectedFile(file);
  }

  return (
    <div className={cn("h-full flex w-full", className)} {...props}>
      <div className="w-[300px] border border-secondary-foreground/10">
        <TreeView data={fileTree} onNodeClick={handleSelectFile} />
      </div>
      <div className="w-full h-full ">
        <CodeEditor code={selectedFile} />
      </div>
    </div>
  );
}
