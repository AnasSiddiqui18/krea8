import { useSnapshot } from "@/hooks/use-snapshot";
import { globalStore } from "@/store/global.store";
import { cn } from "@repo/ui/lib/utils";
import { FileCode } from "lucide-react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { sandbox } from "@/queries/sandbox.queries";
import { getParentFolderIds } from "@/shared/shared";

export function MessageBox({ content, role }: any) {
  const { sbxId, fileTree } = useSnapshot(globalStore);

  const FileEvent = ({
    action,
    path,
    name,
  }: {
    action: string;
    path: string;
    name: string;
  }) => {
    return (
      <span className="p-4 rounded-lg inline-block w-full bg-background/60 backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-background/80 border border-primary/20">
        <span className="flex items-start gap-4 w-full">
          <span className="shrink-0 mt-1 p-2.5 rounded-md bg-primary/10 text-primary shadow-inner">
            <FileCode className="w-4 h-4" />
          </span>

          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium text-foreground truncate">
                {name}
              </span>

              <span
                className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm
                    ${
                      action === "creating"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-blue-500/10 text-blue-500"
                    }
                  `}
              >
                <span
                  className={`
                      w-1.5 h-1.5 rounded-full mr-1.5
                      ${action === "creating" ? "bg-emerald-500" : "bg-blue-500"}
                    `}
                />
                {action === "creating" ? "Created" : "Updated"}
              </span>
            </span>

            <span
              className="text-xs text-muted-foreground/90 leading-relaxed truncate cursor-pointer"
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
      </span>
    );
  };

  const components = {
    "lov-tool-use": ({
      action,
      path,
      name,
    }: {
      action: string;
      path: string;
      name: string;
    }) => <FileEvent action={action} path={path} name={name} />,
  } as Record<string, any>;

  return (
    <div className={cn(role === "assistant" ? "justify-start" : "flex")}>
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
