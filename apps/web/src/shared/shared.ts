import type { TreeNode } from "@/components/builder/tree-view-component"
import { filesEx } from "@/data/data"

export type fileTreeStructure = TreeNode & { path?: string }

export const trimPath = (path: string) => path.split("/").filter((e) => e.trim())

let fileSystemTree: fileTreeStructure[] = []

export function convertFilesToTree(files: any[]) {
    files.forEach((file) => {
        const { file_path } = file as Record<string, string>

        const pathSegments = file_path!.split("/").filter((segment) => segment.trim())

        let currentLevel = fileSystemTree
        let currentPath = ""

        pathSegments.forEach((segment, idx) => {
            currentPath += `/${segment}`

            if (idx === pathSegments.length - 1) {
                const fileNode = {
                    id: crypto.randomUUID(),
                    label: segment,
                    type: "file" as "dir" | "file",
                    path: currentPath,
                }
                currentLevel.push(fileNode)
                return
            }

            const directoryNode = {
                id: crypto.randomUUID(),
                label: segment,
                type: "dir" as "dir" | "file",
                path: currentPath,
                children: [],
            }

            const existingNode = currentLevel.find((child) => child.label === directoryNode.label)

            if (!existingNode) currentLevel.push(directoryNode)
            currentLevel = existingNode?.children ?? directoryNode.children
        })
    })

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

export const isValidPath = (path: string | undefined) => (path ? filesEx.some((p) => path.includes(p)) : false)
