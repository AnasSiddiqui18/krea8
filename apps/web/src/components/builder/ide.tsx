import { TreeView, type TreeNode } from "./tree-view-component"
import { CodeEditor } from "../editor/code-editor"
import { useSnapshot } from "@/hooks/use-snapshot"
import { globalStore } from "@/store/global.store"
import { findSiblingNodes, getParentFolderIds, trimPath } from "@/shared/shared"
import type { fileTreeStructure } from "@/shared/shared"
import { cn } from "@repo/ui/lib/utils"
import { FilePathSelector } from "./file-path-selector"
import { useMemo } from "react"
import { Breadcrumb, BreadcrumbList } from "@repo/ui/components/breadcrumb"

import { sandbox } from "@/queries/sandbox.queries"

type IDEProps = React.ComponentProps<"div">

export function IDE({ className, ...props }: IDEProps) {
    const { fileTree, selectedFile, isPreviewLoading, sbxId } = useSnapshot(globalStore)

    async function handleSelectFile(file: fileTreeStructure) {
        if (!sbxId) {
            console.log("sbxId not found")
            return
        }

        if (file.type !== "file" || !file.path) return

        const code = await sandbox.getFile(file.path, sbxId)

        if (code !== null && !code.success) {
            console.log("failed to get code from server")
            return
        }

        const obj = getParentFolderIds(file.path, fileTree)

        if (!obj) {
            console.error("failed to select file")
            return
        }

        globalStore.selectedFile = {
            code: code.data.file,
            path: file.path,
            parentFolders: obj.parentFolderIds as string[],
            id: file.id,
        }
    }

    const path = useMemo(() => {
        if (!selectedFile.path) return

        const originalPath = trimPath(selectedFile.path)

        let accumulativePath = ""

        const structuredFiles = originalPath.map((path) => {
            accumulativePath += `/${path}`
            const siblings = findSiblingNodes(accumulativePath, fileTree)

            return {
                label: path,
                path: accumulativePath,
                siblings,
            }
        })

        return structuredFiles
    }, [selectedFile.path])

    return (
        <div className={cn("h-full flex w-full", className)} {...props}>
            <div className="w-[300px] border border-secondary-foreground/10 h-9">
                {fileTree.length ? (
                    <TreeView data={fileTree} onNodeClick={handleSelectFile} />
                ) : !fileTree.length && isPreviewLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-10 mt-4">
                        <div className="relative">
                            <div className="h-7 w-7 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                        </div>
                        <div className="flex flex-col items-center text-center text-secondary-foreground">
                            <span className="animate-pulse text-sm">Loading files...</span>
                        </div>
                    </div>
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
                                    )
                                })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <CodeEditor />
            </div>
        </div>
    )
}
