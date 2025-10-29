import { Button } from "@repo/ui/components/button";
import { Separator } from "@repo/ui/components/separator";
import { Textarea } from "@repo/ui/components/textarea";
import { SendIcon } from "lucide-react";
import { MessageBox } from "./message-box";
import { sampleConversation } from "../../../data/data";
import { cn } from "@repo/ui/lib/utils";

export function ChatInterface() {
  return (
    <div className="h-full max-w-md text-secondary relative">
      {/* header */}

      <div className="h-14 top-0 right-0 left-0 p-3">
        <div className="flex gap-4 items-center h-full">
          <div className="font-bold text-base text-primary">Krea8 🚀</div>
          <Separator className="rotate-12 bg-primary" orientation="vertical" />
          <div className="text-secondary-foreground">Todo App</div>
        </div>
      </div>

      <div className="h-[700px] pretty-scrollbar overflow-y-auto flex flex-col gap-y-5 py-5">
        {sampleConversation.map((msg, idx) => {
          return (
            <div
              className={cn(
                "flex px-2",
                msg.role !== "assistant" && "justify-end"
              )}
              key={idx}
            >
              <MessageBox
                content={msg.content}
                role={msg.role as "assistant" | "user"}
              />
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
