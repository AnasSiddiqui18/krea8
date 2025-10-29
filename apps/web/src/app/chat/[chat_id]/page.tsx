"use client";

import React from "react";
import { ChatInterface } from "@/components/builder/chat-interface";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chat_id: string }>;
}) {
  const queryParams = React.use(params);
  console.log(queryParams);

  return (
    <div className="h-screen bg-background">
      <ChatInterface />
    </div>
  );
}
