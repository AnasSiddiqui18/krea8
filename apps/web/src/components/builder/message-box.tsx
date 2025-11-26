import { useSnapshot } from "@/hooks/use-snapshot";
import { sandbox } from "@/queries/sandbox.queries";
import { getParentFolderIds } from "@/shared/shared";
import { globalStore } from "@/store/global.store";
import { cn } from "@repo/ui/lib/utils";
import { FileIcon } from "lucide-react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export function MessageBox({ content, role }: any) {
  const FileEvent = ({ action, path }: { action: string; path: string }) => {
    const { sbxId, fileTree } = useSnapshot(globalStore);

    const actionStyles: Record<string, string> = {
      creating: "border-yellow-500 bg-yellow-50 text-yellow-800",
      updating: "border-orange-500 bg-orange-50 text-orange-800",
      created: "border-green-500 bg-green-50 text-green-800",
      updated: "border-blue-500 bg-blue-50 text-blue-800",
      deleted: "border-red-500 bg-red-50 text-red-800",
    };

    const labelMap: Record<string, string> = {
      created: "Created file",
      creating: "Creating file",
      updating: "Updating file",
      updated: "File Updated",
      deleted: "File Deleted",
    };

    const colorClass =
      actionStyles[action] || "border-gray-400 bg-gray-50 text-gray-700";

    return (
      <span
        className={cn(
          `flex items-center gap-3 border-l-4 px-4 py-2 rounded-md my-2 shadow-sm w-full`,
          colorClass,
        )}
      >
        <FileIcon className="w-4 h-4" />
        <span className="flex flex-col">
          <span className="font-semibold text-sm">
            {labelMap[action] || "File Event"}
          </span>
          <span
            className="text-xs text-gray-500 font-mono cursor-pointer"
            onClick={async () => {
              if (!sbxId) {
                console.error("File selection failed, sandbox id not found");
                return;
              }

              const code = await sandbox.getFile(path, sbxId);

              if (!code.success) {
                console.error("Failed to get file");
                return;
              }

              const obj = getParentFolderIds(path, fileTree);

              if (!obj) {
                console.error("failed to select file");
                return;
              }

              globalStore.selectedFile = {
                code: code.file,
                path: path,
                parentFolders: obj.parentFolderIds as string[],
                id: obj.fileId as string,
              };
            }}
          >
            {path}
          </span>
        </span>
      </span>
    );
  };

  const components = {
    "lov-tool-use": ({ action, path, data }: any) => (
      <FileEvent action={action} path={path} />
    ),
  } as Record<string, any>;

  return (
    <div
      className={cn(
        "flex w-full my-1",
        role === "assistant" ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "rounded-2xl px-4 py-2 prose text-sm leading-relaxed transition-all duration-200",
          role === "assistant"
            ? "text-foreground rounded-tl-none"
            : "bg-primary text-primary-foreground rounded-tr-none",
        )}
      >
        <Markdown components={components} rehypePlugins={[rehypeRaw]}>
          {content}
        </Markdown>
      </div>
    </div>
  );
}
