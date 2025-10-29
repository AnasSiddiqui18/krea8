import { cn } from "@repo/ui/lib/utils";

interface MessageBoxProps {
  content: string;
  role: "assistant" | "user";
}

export function MessageBox({ content, role }: MessageBoxProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-xl text-sm max-w-[75%] leading-relaxed shadow-sm",
        role === "assistant"
          ? "bg-primary/10 border border-primary/20 backdrop-blur-sm text-muted-foreground"
          : "bg-secondary/60 text-muted-foreground border border-secondary/20"
      )}
    >
      {content}
    </div>
  );
}
