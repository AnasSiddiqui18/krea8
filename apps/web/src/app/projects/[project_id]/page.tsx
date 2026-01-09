"use client"

import React, { useEffect, useRef, useState } from "react"
import { ChatInterface } from "@/components/builder/chat-interface"
import { AppPreview } from "@/components/builder/app-preview"
import { useSnapshot } from "@/hooks/use-snapshot"
import { globalStore } from "@/store/global.store"
import { useChat, useChatStore } from "@ai-sdk-tools/store"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { fragmentSchema } from "@/schema/schema"
import { convertFilesToTree, emitFileChangeStatusMessage, pushMessageInChat } from "@/shared/shared"
import { overlayCodeOnTopOfTemplate } from "@repo/shared/utils/overlay-code-on-template"
import { DefaultChatTransport } from "ai"
import { sandbox } from "@/queries/sandbox.queries"
import { useFetch } from "@/hooks/use-fetch"
import { projects } from "@/queries/project.queries"

export default function ChatPage({ params }: { params: Promise<{ project_id: string }> }) {
    const { initial_prompt, sbxId } = useSnapshot(globalStore)
    const hasMessageSend = useRef(false)
    const { pushMessage, setNewChat } = useChatStore()
    const processedPaths = useRef<Map<string, string>>(new Map())
    const [websiteGenerationCompleted, setWebsiteGenerationCompleted] = useState(false)
    const resolvedParams = React.use(params)

    const { isPending } = useFetch({
        queryKey: ["fetch_chats", resolvedParams.project_id],
        queryFn: async () => {
            try {
                const projectId = resolvedParams.project_id

                const { success, data } = await projects.getProjectsChats(projectId)

                if (!success) {
                    console.error("Failed to fetch chats")
                    return null
                }

                const chatResponse = pushMessageInChat(data.chats.content, setNewChat)

                if (!chatResponse.success) {
                    console.error("Failed to push chats inside AI store")
                    return null
                }

                const iframeEl = document.querySelector("iframe")!
                return (iframeEl.src = data.project.url)
            } catch (error) {
                console.error("Failed to fetch chats", error)
                return null
            }
        },
    })

    useEffect(() => {
        globalStore.isFetchingChats = isPending
    }, [isPending])

    const { isPending: isFetchingFiles } = useFetch({
        queryKey: ["fetch_files", resolvedParams.project_id],
        enabled: !initial_prompt,
        queryFn: async () => {
            try {
                const projectId = resolvedParams.project_id

                const files = await sandbox.getFiles(projectId)

                if (!files.success) {
                    console.error("Failed to fetch files")
                    return null
                }

                const structuredFiles = convertFilesToTree(files.data.files)

                globalStore.fileTree = structuredFiles
                globalStore.sbxId = projectId
                return files.data.files
            } catch (error) {
                console.error("Failed to fetch files", error)
                return null
            }
        },
    })

    const { object, submit } = useObject({
        api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/create-website/${sbxId}`,
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

            if (!event?.object?.sandboxId) return console.error("sandboxId not found")

            const object = overlayCodeOnTopOfTemplate(event.object.fileBlocks)

            const structuredFiles = convertFilesToTree(object)
            globalStore.fileTree = structuredFiles
            setWebsiteGenerationCompleted(true)
        },

        onError() {
            globalStore.isPreviewLoading = false

            pushMessage({
                id: crypto.randomUUID(),
                role: "assistant",
                parts: [
                    {
                        text: `⚠️ Website generation failed. Please try again.`,
                        type: "text",
                    },
                ],
            })
        },
    })

    useFetch({
        queryKey: ["get_status"],
        enabled: websiteGenerationCompleted,
        staleTime: Infinity,
        refetchInterval: ({ state }) => {
            const data = state.data
            if (!data) return false
            if (data.status === "progress") return 5000
            if (data.status === "completed") globalStore.isPreviewLoading = false
            return false
        },
        queryFn: async () => {
            if (!sbxId) {
                console.log("sbxId not found")
                return null
            }

            const response = await sandbox.getCreationStatus(sbxId, initial_prompt)

            if (!response || !response.data) {
                console.error("Failed to get status")
                return null
            }

            globalStore.server_url = response.data.server_url
            return response.data
        },
    })

    const { sendMessage, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/create-plan/${sbxId}`,
        }),

        onFinish: ({ isError }) => {
            if (isError) {
                return
            }

            console.log("chat streaing finished")
            submit({ prompt: initial_prompt })
            globalStore.isPreviewLoading = true
        },

        onError() {
            globalStore.isPreviewLoading = false

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    parts: [
                        {
                            text: `⚠️ Website plan generation failed. Please try again.`,
                            type: "text",
                        },
                    ],
                },
            ])
        },
    })

    useEffect(() => {
        if (object && object.fileBlocks) emitFileChangeStatusMessage(object, processedPaths, pushMessage)
    }, [object])

    useEffect(() => {
        if (!initial_prompt || hasMessageSend.current) return
        sendMessage({ text: initial_prompt })
        hasMessageSend.current = true
        globalStore.isPreviewLoading = true
    }, [initial_prompt])

    return (
        <div className="h-screen bg-background flex">
            <ChatInterface />
            <AppPreview />
        </div>
    )
}
