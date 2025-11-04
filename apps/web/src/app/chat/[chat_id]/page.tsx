"use client";

import React, { useEffect, useRef } from "react";
import { ChatInterface } from "@/components/builder/chat-interface";
import { AppPreview } from "@/components/builder/app-preview";
import { useMutation } from "@tanstack/react-query";
import { useSnapshot } from "@/hooks/use-snapshot";
import { globalStore, type Chat } from "@/store/global.store";
import { orpcClient } from "@/orpc/orpc-client";
import {
  convertFiles,
  convertFilesToTree,
  setupWebContainer,
} from "@/shared/shared";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chat_id: string }>;
}) {
  const { initial_prompt } = useSnapshot(globalStore);
  const hasAlreadyMutated = useRef(false);

  let tempalte = "";

  const { mutate } = useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      try {
        const iterator = (await orpcClient.website.create({
          prompt: prompt ?? "fallback prompt",
        })) as any;

        for await (const event of iterator) {
          const lastIndex = globalStore.chat.length - 1;
          const agentMessage = globalStore.chat.at(1) as Chat;

          if (event.data === "message") {
            // normal message

            if (!agentMessage) {
              globalStore.chat.push({
                content: { message: event.message, type: event.data },
                role: "assistant",
                isThinking: true,
              });

              //
            } else {
              agentMessage.content = {
                type: event.data,
                message: (agentMessage.content.message += event.message),
              };
              globalStore.chat[lastIndex] = agentMessage;
            }
          } else if (event.data === "status") {
            const object = {
              type: event.data,
              message: event.message,
            };

            globalStore.chat.push({
              content: object,
              isThinking: false,
              role: "assistant",
            });

            if (event.message === "Template streamed successfully") {
              try {
                globalStore.template = tempalte;
                const parsedJson = JSON.parse(tempalte);

                if (!parsedJson.template.files) {
                  console.error("files not found returning...");
                  return;
                }

                console.log("template files", parsedJson.template.files);

                const fileTree = convertFilesToTree(parsedJson.template.files);
                globalStore.fileTree = fileTree;
              } catch (error) {
                console.error("Failed to parse template json");
              }
            }
          } else if (event.data === "code") {
            tempalte += event.message;
          }
        }
      } catch (error) {
        console.error("Failed to post to server", error);
      }
    },
  });

  const resolvedParams = React.use(params);

  useEffect(() => {
    if (!resolvedParams.chat_id || !initial_prompt || hasAlreadyMutated.current)
      return;

    mutate({ prompt: initial_prompt });
    hasAlreadyMutated.current = true;
  }, [resolvedParams.chat_id, initial_prompt, mutate]);

  return (
    <div className="h-screen bg-background flex">
      <ChatInterface />
      <AppPreview />
    </div>
  );
}
