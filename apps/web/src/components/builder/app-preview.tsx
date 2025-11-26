import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Code, Eye, RotateCw, SquareArrowOutUpRight } from "lucide-react";
import { useState } from "react";
import { IDE } from "./ide";
import { PreviewComponent } from "./preview-component";

export function AppPreview() {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="h-14 p-3 border-b-2 border-secondary flex justify-between">
        <div className="flex items-center space-x-2 justify-center mx-auto">
          <Button
            size="sm"
            className={`rounded-md h-7 px-3 text-sm font-medium transition-all duration-300 ${
              showPreview
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-transparent text-muted-foreground hover:bg-secondary"
            }`}
            onClick={() => setShowPreview(true)}
          >
            Preview
          </Button>

          <Button
            size="sm"
            className={`rounded-md h-7 px-3 text-sm font-medium transition-all duration-300 ${
              !showPreview
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-transparent text-muted-foreground hover:bg-secondary"
            }`}
            onClick={() => setShowPreview(false)}
          >
            Code
          </Button>

          <div className="flex items-center space-x-1 pl-2 ml-2 border-l border-border">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:bg-secondary hover:text-accent-foreground transition-colors"
              title="Reload Project"
            >
              <RotateCw className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:bg-secondary hover:text-accent-foreground transition-colors"
              title="Open in New Tab"
            >
              <SquareArrowOutUpRight className="h-4 w-4" />
            </Button>
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
      <PreviewComponent className={showPreview ? "flex" : "hidden"} />
    </div>
  );
}
