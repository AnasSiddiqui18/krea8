import { useEffect, useRef } from "react";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";

export function CodeEditor({
  code,
  lang,
  onChange,
}: {
  code?: string;
  lang?: string;
  onChange?: (value: string | undefined) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let editor: any | null = null;

    (async () => {
      const highlighter = await createHighlighter({
        themes: ["github-dark-default"],
        langs: ["javascript", "typescript", "css", "html", "json"],
      });

      const monaco = await import("monaco-editor-core");
      monaco.languages.register({ id: "javascript" });
      monaco.languages.register({ id: "typescript" });
      monaco.languages.register({ id: "css" });
      monaco.languages.register({ id: "html" });
      monaco.languages.register({ id: "json" });

      shikiToMonaco(highlighter, monaco);

      if (containerRef.current) {
        editor = monaco.editor.create(containerRef.current, {
          value: code,
          language: "typescript",
          theme: "github-dark-default",
          minimap: { enabled: false },
          suggestOnTriggerCharacters: true,
          automaticLayout: true,
          fontSize: 14,
          padding: { top: 10, bottom: 10 },
        });
      }
    })();

    return () => {
      if (editor) {
        editor.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
