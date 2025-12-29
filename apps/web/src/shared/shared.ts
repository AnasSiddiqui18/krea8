import type { DirNode, TreeNode } from "@/components/builder/tree-view-component"
import { sendSuccess } from "@/lib/response"
import { extractFilePath } from "@repo/shared/utils/extract-file-path"
import type { UIDataTypes, UIMessage, UITools } from "ai"
import type { RefObject } from "react"

export type fileTreeStructure = TreeNode & { path?: string }

export const trimPath = (path: string) => path.split("/").filter((e) => e.trim())

const isCodeContent = (content: string) => {
    return /<krea8file\b[^>]*\bpath\s*=\s*"[^"]+"[^>]*>/.test(content)
}

const splitCodeTag = (fileBlock: string) => fileBlock.match(/^<krea8file\b[^>]*>/)?.[0] as string

let fileSystemTree: fileTreeStructure[] = []

export function convertFilesToTree(files: Record<string, string>) {
    for (const [path] of Object.entries(files)) {
        const pathSegments = path.split("/").filter((segment) => segment.trim())

        let currentLevel = fileSystemTree
        let currentPath = ""

        pathSegments.forEach((segment, idx) => {
            currentPath += `/${segment}`

            if (idx === pathSegments.length - 1) {
                const fileNode = {
                    id: crypto.randomUUID(),
                    label: segment,
                    type: "file" as "file",
                    path: currentPath,
                }
                currentLevel.push(fileNode)
                return
            }

            const directoryNode = {
                id: crypto.randomUUID(),
                label: segment,
                type: "dir" as "dir",
                path: currentPath,
                children: [],
            }

            const existingNode = currentLevel.find((child): child is DirNode => child.label === directoryNode.label)

            if (!existingNode) currentLevel.push(directoryNode)

            currentLevel = existingNode ? existingNode.children : directoryNode.children
        })
    }

    return fileSystemTree
}

export function findSiblingNodes(targetPath: string, fileTree: fileTreeStructure[]) {
    const pathSegments = trimPath(targetPath)
    let currentLevel: fileTreeStructure[] = fileTree
    let accumulatedPath = ""

    return pathSegments
        .map((segment) => {
            if (!currentLevel.length) return

            accumulatedPath += `/${segment}`

            const isSrcPath = targetPath === "/src"

            const currentNode = currentLevel.find((node) => node.path === accumulatedPath)

            if (!isSrcPath && currentNode?.children) currentLevel = currentNode?.children ?? []

            const isTargetChild = currentLevel.find((child: fileTreeStructure) => child?.path === targetPath)

            if (isTargetChild) {
                const siblingNodes = currentLevel.filter((child: fileTreeStructure) => child?.path !== targetPath)

                currentLevel = []
                return siblingNodes
            }

            currentLevel = currentNode?.children ?? []
        })
        .filter(Boolean)
        .at(0)
}

export function objectToForm<T extends Record<string, string | File | null | undefined | boolean>>(object: T) {
    const formData = new FormData()

    for (const key in object) {
        if (object[key] instanceof File) {
            formData.append(key, object[key] ?? "")
        } else {
            formData.append(key, object[key]?.toString() ?? "")
        }
    }

    return formData
}

export function getParentFolderIds(filePath: string, rootTree: TreeNode[]) {
    const pathSegments = trimPath(filePath)
    if (!pathSegments.length) return null

    const result: { fileId: string | null; parentFolderIds: string[] } = {
        fileId: null,
        parentFolderIds: [],
    }

    let currentNodes = rootTree

    pathSegments.forEach((segment, index) => {
        const node = currentNodes.find((n) => n.label === segment)
        if (!node) return

        result.parentFolderIds.push(node.id)

        if (index === pathSegments.length - 1) {
            result.fileId = node.id
        }

        currentNodes = node.children as TreeNode[]
    })

    return result
}

export function emitFileChangeStatusMessage(
    object: any,
    processedPaths: RefObject<Map<string, string>>,
    pushMessage: (message: UIMessage<unknown, UIDataTypes, UITools>) => void,
) {
    const content = object.fileBlocks.at(-1)
    if (!content?.rawFileBlock) return

    const fileBlock = content.rawFileBlock

    const isCodeTag = isCodeContent(fileBlock)

    if (!isCodeTag) return

    const filePath = extractFilePath(fileBlock)

    if (!filePath) return console.error("failed to extract file path")

    if (!processedPaths.current.has(filePath)) {
        const splittedTag = splitCodeTag(fileBlock)
        if (!splittedTag) return console.error(`Failed to split fileBlock ${fileBlock}`)

        processedPaths.current.set(filePath, fileBlock)

        pushMessage({
            id: crypto.randomUUID(),
            role: "assistant",
            parts: [{ text: splittedTag, type: "text" }],
        })
    }
}

export function pushMessageInChat(
    chats: { role: "user" | "assistant"; type: "text"; content: string }[],
    pushMessage: (id: string, messages: UIMessage<unknown, UIDataTypes, UITools>[]) => void,
) {
    try {
        const updatedChat = chats.map((chat) => {
            const id = crypto.randomUUID()
            const isCodeTag = isCodeContent(chat.content)

            if (isCodeTag) {
                const splittedTag = splitCodeTag(chat.content)
                return { id, role: chat.role, parts: [{ type: chat.type, text: splittedTag }] }
            }

            return { id, role: chat.role, parts: [{ type: chat.type, text: chat.content }] }
        })

        pushMessage(crypto.randomUUID(), updatedChat)

        return sendSuccess("Chats pushed")
    } catch (error) {
        return sendSuccess("Failed to push chats")
    }
}
