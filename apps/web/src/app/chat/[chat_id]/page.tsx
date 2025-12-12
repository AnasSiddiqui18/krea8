"use client"

import React, { useEffect, useRef, useState } from "react"
import { ChatInterface } from "@/components/builder/chat-interface"
import { AppPreview } from "@/components/builder/app-preview"
import { useSnapshot } from "@/hooks/use-snapshot"
import { globalStore } from "@/store/global.store"
import { useChat, useChatStore } from "@ai-sdk-tools/store"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { fragmentSchema } from "@/schema/schema"
import { convertFilesToTree, isValidPath } from "@/shared/shared"
import { DefaultChatTransport } from "ai"
import { useQuery } from "@tanstack/react-query"
import { sandbox } from "@/queries/sandbox.queries"

export default function ChatPage({ params }: { params: Promise<{ chat_id: string }> }) {
    const { initial_prompt } = useSnapshot(globalStore)
    const hasMessageSend = useRef(false)
    const { pushMessage } = useChatStore()
    const processedPaths = useRef<Map<string, string>>(new Map())
    const [sbxId, setSbxId] = useState<null | string>(null)

    const { object, submit } = useObject({
        api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/create-website`,
        schema: fragmentSchema,
        onFinish: async (event) => {
            console.log("finish website creation")

            if (event.error) {
                console.error("Website creation failed", event.error)
                return
            }

            const completionMessage = event.object?.completion_message

            if (completionMessage) {
                pushMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    parts: [{ text: completionMessage, type: "text" }],
                })
            }

            if (!event?.object?.code) return console.error("code not found")
            if (!event?.object?.sandboxId) return console.error("sandboxId not found")

            const code = event.object.code
            const sbdxId = event.object.sandboxId
            const structuredFiles = convertFilesToTree(code)
            globalStore.fileTree = structuredFiles
            globalStore.sbxId = sbdxId
            setSbxId(sbdxId)
        },
    })

    useQuery({
        queryKey: ["get_status"],
        refetchOnMount: false,
        enabled: !!sbxId,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        refetchInterval: ({ state }) => {
            const data = state.data
            if (!data) return false
            if (data.status === "progress") return 5000
            if (data.status === "completed") {
                globalStore.isPreviewLoading = false
                globalStore.server_url = data.server_url
            }
            return false
        },
        queryFn: async () => {
            if (!sbxId) {
                console.log("sbxId not found")
                return null
            }

            const data = await sandbox.getCreationStatus(sbxId)

            if (!data.success) {
                console.error("Failed to get status")
                return null
            }

            return data.data
        },
    })

    const { sendMessage } = useChat({
        transport: new DefaultChatTransport({
            api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/init`,
        }),

        onFinish: () => {
            console.log("chat streaing finished")
            submit({ prompt: initial_prompt })
            globalStore.isPreviewLoading = true
        },
    })

    useEffect(() => {
        if (object && object.code) {
            const currentFile = object.code.at(-1)
            const currentPath = currentFile?.file_path
            const currentAction = currentFile?.action
            const isPathValid = isValidPath(currentPath)

            if (currentPath && isPathValid && currentAction && !processedPaths.current.has(currentPath)) {
                const content = `<krea8-file-action name=${currentFile.file_name} action='${currentFile.action}' path='${currentFile.file_path}'></krea8-file-action>`

                processedPaths.current.set(currentPath, currentAction)

                pushMessage({
                    id: crypto.randomUUID(),
                    role: "assistant",
                    parts: [{ text: content, type: "text" }],
                })
            }
        }
    }, [object])

    useEffect(() => {
        if (!initial_prompt || hasMessageSend.current) return
        hasMessageSend.current = true
        sendMessage({ text: initial_prompt })
        globalStore.isPreviewLoading = true
    }, [initial_prompt])

    const resolvedParams = React.use(params)

    return (
        <div className="h-screen bg-background flex">
            <ChatInterface />
            <AppPreview />
        </div>
    )
}
