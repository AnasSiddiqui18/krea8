import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { SendIcon } from "lucide-react";
import { MessageBox } from "./message-box";
import {
  useChatMessages,
  useChatStatus,
  useChatStore,
} from "@ai-sdk-tools/store";
import { TextShimmer } from "@repo/ui/components/text-shimmer";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { websiteUpdateSchema } from "@/schema/schema";
import { isValidPath } from "@/shared/shared";
import { useSnapshot } from "@/hooks/use-snapshot";
import { globalStore } from "@/store/global.store";

const updateWebsiteSchema = z.object({
  prompt: z.string(),
});

export function ChatInterface() {
  const messages = useChatMessages();
  const status = useChatStatus();
  const chatElRef = useRef<HTMLDivElement | null>(null);
  const { pushMessage } = useChatStore();
  const { sbxId } = useSnapshot(globalStore);
  const processedPaths = useRef<Map<string, string>>(new Map());

  const { object, submit } = useObject({
    api: `${process.env.NEXT_PUBLIC_SERVER_URL}/website/update-website/${sbxId}`,
    fetch: (async (input, init = {}) => {
      const mergedInit: RequestInit = {
        ...init,
        method: "PATCH",
        headers: {
          ...(init.headers instanceof Headers
            ? Object.fromEntries((init.headers as Headers).entries())
            : (init.headers as Record<string, string> | undefined)),
          "Content-Type": "application/json",
        },
        credentials: init.credentials ?? "same-origin",
      };

      return fetch(input, mergedInit);
    }) as typeof fetch,
    schema: websiteUpdateSchema,
    onFinish: async (event) => {
      if (event.error) {
        console.error("Website creation failed", event.error);
        return;
      }

      console.log("website updated");
    },
  });

  useEffect(() => {
    if (object && object.code) {
      const currentFile = object.code.at(-1);
      const currentPath = currentFile?.path;
      const currentAction = currentFile?.action;
      const isPathValid = isValidPath(currentPath);

      if (
        currentPath &&
        isPathValid &&
        currentAction &&
        !processedPaths.current.has(currentPath)
      ) {
        const content = `<lov-tool-use name=${"Unknown"} action='${currentFile.action}' path='${currentFile.path}'></lov-tool-use>`;

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
    if (chatElRef.current) {
      chatElRef.current.scrollTop = chatElRef.current.scrollHeight;
    }
  }, [messages]);

  const form = useForm({
    resolver: zodResolver(updateWebsiteSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function handleWebsiteUpdate(
    input: z.infer<typeof updateWebsiteSchema>,
  ) {
    try {
      const response = submit({ prompt: input.prompt });
    } catch (error) {
      console.log("failed to update website");
    }
  }

  return (
    <div className="h-full w-lg text-secondary relative border-r-2 border-secondary">
      <div className="h-14 p-3 border-b-2 border-secondary">
        <div
          onClick={() => redirect("/")}
          className="font-bold text-lg text-primary cursor-pointer inline"
        >
          Krea8 🚀
        </div>
      </div>

      <div
        className="h-[700px] pretty-scrollbar overflow-y-auto py-5 space-y-3"
        ref={chatElRef}
      >
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

        <div className="px-2">
          {status === "submitted" && <TextShimmer>Thinking...</TextShimmer>}
        </div>
      </div>

      <Form {...form}>
        <form
          className="absolute bottom-6 right-5 left-5 h-36 border border-primary/20 rounded-md"
          onSubmit={form.handleSubmit(handleWebsiteUpdate)}
        >
          <FormField
            name="prompt"
            control={form.control}
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormControl>
                    <Textarea
                      {...field}
                      name="prompt-area"
                      className="pretty-scrollbar resize-none focus-visible:ring-0 border-none text-sm h-full text-muted-foreground placeholder:text-muted-foreground"
                      rows={3}
                      placeholder="Please adjust the navbar logo.."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <Button className="absolute right-2 bottom-2 rounded-full p-3 size-8">
            <SendIcon />
          </Button>
        </form>
      </Form>
    </div>
  );
}
