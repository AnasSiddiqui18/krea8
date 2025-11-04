import { useEffect, useRef } from "react";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";
import type { editor } from "monaco-editor-core";

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
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);

  useEffect(() => {
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

      if (containerRef.current && !editorRef.current) {
        editorRef.current = monaco.editor.create(containerRef.current, {
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
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && code) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== code) {
        editorRef.current.setValue(code);
      }
    }
  }, [code]);

  return <div ref={containerRef} className="h-full" />;
}
