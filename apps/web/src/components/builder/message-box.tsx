import type { Chat } from "@/store/global.store";

export function MessageBox({ content }: Chat) {
  return content?.type === "message" ? (
    <div className="p-3 text-sm leading-relaxed text-muted-foreground ">
      {content.message}
    </div>
  ) : content?.type === "status" ? (
    <div className="p-3 text-sm leading-relaxed text-muted-foreground font-bold">
      {content.message}
    </div>
  ) : (
    <div className="bg-secondary/60 text-muted-foreground max-w-[300px] text-sm p-3 rounded-xl">
      {content.message}
    </div>
  );
}
