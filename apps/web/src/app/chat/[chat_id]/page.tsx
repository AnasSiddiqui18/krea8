"use client";

import React, { useEffect, useRef } from "react";
import { ChatInterface } from "@/components/builder/chat-interface";
import { AppPreview } from "@/components/builder/app-preview";
import { useSnapshot } from "@/hooks/use-snapshot";
import { globalStore } from "@/store/global.store";
import { useChat, useChatStore } from "@ai-sdk-tools/store";
import { filesEx, projectFiles } from "@/data/data";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { fragmentSchema } from "@/schema/schema";
import {
  installDeps,
  mountTemplateFilesInWebContainer,
  updateContainerFiles,
} from "@/shared/shared";
import { NextTemplate } from "@/templates/next-template";
import { DefaultChatTransport } from "ai";

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

      if (code?.length) {
        code?.forEach((c) => {
          const isFilesPresent = projectFiles.find(
            (file) => file.file_path === c.file_path,
          );

          if (!isFilesPresent) {
            const newFiles = { file_path: c.file_path };
            projectFiles.push(newFiles);
          }
        });

        console.log("updating container files");

        const structuredFiles = await updateContainerFiles(code, projectFiles);

        if (!structuredFiles) {
          console.error("Failed to update files inside container");
          return;
        }

        globalStore.fileTree = structuredFiles;
        await installDeps();
      }
    },
  });

  const { sendMessage, error, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/init`,
    }),

    onFinish: async ({ isError }) => {
      if (isError) {
        console.log("error", error);
        return;
      }

      console.log("chat streaing finished", status);

      globalStore.isPreviewLoading = true;
      await mountTemplateFilesInWebContainer(NextTemplate);
      submit({ prompt: initial_prompt });
    },
  });

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
  }, [initial_prompt]);

  const resolvedParams = React.use(params);

  return (
    <div className="h-screen bg-background flex">
      <ChatInterface />
      <AppPreview />
    </div>
  );
}
