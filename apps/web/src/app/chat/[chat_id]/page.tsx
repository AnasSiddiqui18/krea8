"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChatInterface } from "@/components/builder/chat-interface";
import { AppPreview } from "@/components/builder/app-preview";
import { useSnapshot } from "@/hooks/use-snapshot";
import { globalStore } from "@/store/global.store";
import { useChat, useChatStore } from "@ai-sdk-tools/store";
import { filesEx } from "@/data/data";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { fragmentSchema } from "@/schema/schema";
import {
  convertFilesToTree,
  convertObjToArr,
  extractCodeContent,
} from "@/shared/shared";
import { DefaultChatTransport } from "ai";
import { useQuery } from "@tanstack/react-query";
import { sandbox } from "@/queries/sandbox.queries";

const isValidPath = (path: string | undefined) =>
  path ? filesEx.some((p) => path.includes(p)) : false;

export default function ChatPage({
  params,
}: {
  params: Promise<{ chat_id: string }>;
}) {
  const { initial_prompt } = useSnapshot(globalStore);
  const hasMessageSend = useRef(false);
  const { pushMessage } = useChatStore();
  const processedPaths = useRef<Map<string, string>>(new Map());
  const [sbxId, setSbxId] = useState<null | string>(null);

  const { object, submit } = useObject({
    api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/create-website`,
    schema: fragmentSchema,
    onFinish: async (event) => {
      console.log("finish website creation");

      if (event.error) {
        console.error("Website creation failed", event.error);
        return;
      }

      const completionMessage = event.object?.completion_message;

      if (completionMessage) {
        pushMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [{ text: completionMessage, type: "text" }],
        });
      }

      const code = event.object?.code;

      console.log("website generation finished");

      if (code?.length) {
        const updatedObj = extractCodeContent(code);
        const arr = convertObjToArr(updatedObj);
        const structuredFiles = convertFilesToTree(arr);
        globalStore.fileTree = structuredFiles;

        try {
          const response = await sandbox.create(updatedObj);

          if (response.success && response.sbxId) {
            const sandboxId = response.sbxId;
            setSbxId(sandboxId);
            globalStore.sbxId = sandboxId;
          }
        } catch (error) {
          console.log("failed to call /sandbox/create", error);
        }
      }
    },
  });

  const { data } = useQuery({
    queryKey: ["get_status"],
    refetchOnMount: false,
    enabled: !!sbxId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    refetchInterval: ({ state }) => {
      const data = state.data;
      if (data && data.status === "progress") return 5000;
      return false;
    },
    queryFn: async () => {
      if (!sbxId) {
        console.log("sbxId not found");
        return;
      }

      const data = await sandbox.getCreationStatus(sbxId);

      return data;
    },
  });

  const { sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/init`,
    }),

    onFinish: () => {
      console.log("chat streaing finished");
      submit({ prompt: initial_prompt });
      globalStore.isPreviewLoading = true;
    },
  });

  useEffect(() => {
    if (data && data.status === "completed") {
      const iframeEl = document.querySelector("#iframeEL") as HTMLIFrameElement;

      if (!iframeEl) {
        console.error("iframeEl not found");
        return;
      }

      // TODO remove this timeout and get the server url when the server is fully loaded

      setTimeout(() => {
        globalStore.isPreviewLoading = false;
        console.log("setting server url", data.server_url);
        iframeEl.src = data.server_url;
      }, 10000);
    }
  }, [data]);

  useEffect(() => {
    if (object && object.code) {
      const currentFile = object.code.at(-1);
      const currentPath = currentFile?.file_path;
      const currentAction = currentFile?.action;
      const isPathValid = isValidPath(currentPath);

      if (
        currentPath &&
        isPathValid &&
        currentAction &&
        !processedPaths.current.has(currentPath)
      ) {
        const content = `<lov-tool-use action='${currentFile?.action}' path='${currentFile?.file_path}'></lov-tool-use>`;

        processedPaths.current.set(currentPath, currentAction);

        pushMessage({
          id: crypto.randomUUID(),
          role: "assistant",
          parts: [{ text: content, type: "text" }],
        });
      }
    }
  }, [object]);

  useEffect(() => {
    if (!initial_prompt || hasMessageSend.current) return;
    hasMessageSend.current = true;
    sendMessage({ text: initial_prompt });
    globalStore.isPreviewLoading = true;
  }, [initial_prompt]);

  const resolvedParams = React.use(params);

  return (
    <div className="h-screen bg-background flex">
      <ChatInterface />
      <AppPreview />
    </div>
  );
}
