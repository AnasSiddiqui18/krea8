import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Textarea } from "@repo/ui/components/textarea";
import { SendIcon } from "lucide-react";
import { MessageBox } from "./message-box";
import z from "zod";
import { useChatMessages } from "@ai-sdk-tools/store";

export function ChatInterface() {
  const messages = useChatMessages();

  return (
    <div className="h-full w-lg text-secondary relative border-r-2 border-secondary">
      {/* header */}

      <div className="h-14 p-3 border-b-2 border-secondary">
        <div className="flex gap-4 items-center h-full">
          <div className="font-bold text-base text-primary">Krea8 🚀</div>
          <Separator className="rotate-12 bg-primary" orientation="vertical" />
          <div className="text-secondary-foreground">Todo App</div>
        </div>
      </div>

      <div className="h-[700px] pretty-scrollbar overflow-y-auto py-5 space-y-3">
        {messages.map((msg, idx) => {
          return (
            <div className="px-2" key={idx}>
              {msg.parts.map((part, idx) => {
                return part.type === "text" ? (
                  <MessageBox
                    key={idx}
                    content={part.text}
                    role={msg.role as "assistant" | "user"}
                  />
                ) : null;
              })}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 right-5 left-5 h-36 border border-primary/20 rounded-md">
        <Textarea
          name="prompt-area"
          className="pretty-scrollbar resize-none focus-visible:ring-0 border-none text-sm h-full text-muted-foreground placeholder:text-muted-foreground"
          rows={3}
          placeholder="Please adjust the navbar logo.."
        />

        <Button className="absolute right-2 bottom-2 rounded-full p-3 size-8">
          <SendIcon />
        </Button>
      </div>
    </div>
  );
}
