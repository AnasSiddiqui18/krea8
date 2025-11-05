import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Code, Eye, RotateCw, SquareArrowOutUpRight } from "lucide-react";
import { useState } from "react";
import { IDE } from "./ide";
import { PreviewComponent } from "./preview-component";

export function AppPreview() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="h-14 p-3 border-b-2 border-secondary flex justify-between">
        <div className="flex items-center gap-x-3 p-3 rounded-md bg-secondary backdrop-blur-sm border border-border shadow-sm">
          <Button
            size="sm"
            className={`rounded-md transition-all duration-200 h-6 ${
              showPreview
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-transparent"
            }`}
            onClick={() => setShowPreview(true)}
          >
            <Eye />
          </Button>

          <Button
            size="sm"
            className={`rounded-md transition-all duration-200 h-6 ${
              !showPreview
                ? "bg-primary text-white shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-transparent"
            }`}
            onClick={() => setShowPreview(false)}
          >
            <Code />
          </Button>
        </div>

        {/* url bar */}

        <div className="border border-primary/50 w-[400px] rounded-full relative flex justify-between items-center px-2">
          <Input
            className="size-full focus-visible:ring-0 border-none placeholder:text-muted-foreground/50"
            placeholder="https://webcontainer.io/todo-app"
            readOnly
          />

          <div className="flex space-x-2">
            <RotateCw
              className="text-secondary-foreground cursor-pointer"
              size={13}
            />

            <SquareArrowOutUpRight
              className="text-secondary-foreground cursor-pointer"
              size={13}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button size="sm">Deploy</Button>
          <Button variant="secondary" size="sm">
            Feedback
          </Button>
        </div>
      </div>

      <IDE className={showPreview ? "hidden" : "flex"} />
      <PreviewComponent className={showPreview ? "block" : "hidden"} />
    </div>
  );
}
