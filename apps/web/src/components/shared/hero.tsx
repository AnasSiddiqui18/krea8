import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { SendHorizontal } from "lucide-react";

export function Hero() {
  return (
    <div className="flex flex-col h-full items-center max-w-5xl mx-auto px-6 text-center pt-16">
      <div className="flex flex-col gap-8 mb-8">
        <h1 className="text-7xl font-semibold tracking-tight leading-tight text-balance">
          <span className="text-primary-dark block">
            Bring your{" "}
            <span className="text-primary font-bold">vision to life</span>
          </span>
          <span className="text-primary-dark">with just words.</span>
        </h1>

        <p className="text-primary-dark/70 text-lg font-medium max-w-2xl mx-auto leading-relaxed tracking-wide">
          Transform your ideas into functional applications with natural
          language - where creativity meets precision.
        </p>
      </div>

      <MainPromptArea />
    </div>
  );
}

function MainPromptArea() {
  return (
    <div className="h-64 bg-white w-full flex flex-col justify-between items-end rounded-md border-2 border-primary/80 py-5 px-3">
      <Textarea
        name="prompt-area"
        className="pretty-scrollbar resize-none focus-visible:ring-0 h-44 bg-white border-none text-base text-primary-dark"
        rows={4}
        placeholder="What would you like to build today? Want to create a landing page or a todo app?"
      />

      <div className="mt-5">
        <Button>
          Start building
          <SendHorizontal className="ml-1" />
        </Button>
      </div>
    </div>
  );
}
