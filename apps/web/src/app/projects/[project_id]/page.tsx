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
import { axios } from "@/lib/axios"
import { useFetch } from "@/hooks/use-fetch"

export default function ChatPage({ params }: { params: Promise<{ project_id: string }> }) {
    const { initial_prompt, sbxId } = useSnapshot(globalStore)
    const hasMessageSend = useRef(false)
    const { pushMessage, setNewChat } = useChatStore()
    const processedPaths = useRef<Map<string, string>>(new Map())
    const [websiteGenerationCompleted, setWebsiteGenerationCompleted] = useState(false)
    const resolvedParams = React.use(params)

    const { isPending, isError, error } = useFetch({
        queryKey: ["fetch_chats"],
        enabled: !!resolvedParams.project_id,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        queryFn: async () => {
            try {
                const chats = await axios.get(`/projects/get-chats/${resolvedParams.project_id}`)

                const { data } = chats

                if (!data.success) {
                    console.error("Failed to fetch projects")
                    return null
                }

                const chatResponse = pushMessageInChat(data.chats.content, setNewChat)

                if (!chatResponse.success) {
                    console.error("Failed to push chats inside AI store")
                    return null
                }

                return null
            } catch (error) {
                console.error("Failed to fetch projects", error)
            }
        },
    })

    useEffect(() => {
        if (isPending) globalStore.isFetchingChats = true
        return () => {
            globalStore.isFetchingChats = false
        }
    }, [isPending])

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
