import { useEffect, useRef, useState } from "react"
import { shikiToMonaco } from "@shikijs/monaco"
import { createHighlighter } from "shiki"
import type { editor } from "monaco-editor-core"
import { useSnapshot } from "@/hooks/use-snapshot"
import { globalStore } from "@/store/global.store"
import { SaveAlert } from "../builder/save-alert"

export function CodeEditor() {
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<editor.IStandaloneCodeEditor>(null)
    const { selectedFile } = useSnapshot(globalStore)
    const [hasChangeCode, setHasChangeCode] = useState(false)

    function toggleSaveAlert() {
        setHasChangeCode(!hasChangeCode)
    }

    useEffect(() => {
        ;(async () => {
            const highlighter = await createHighlighter({
                themes: ["github-dark-default"],
                langs: ["javascript", "typescript", "css", "html", "json"],
            })

            const monaco = await import("monaco-editor-core")
            monaco.languages.register({ id: "javascript" })
            monaco.languages.register({ id: "typescript" })
            monaco.languages.register({ id: "css" })
            monaco.languages.register({ id: "html" })
            monaco.languages.register({ id: "json" })

            shikiToMonaco(highlighter, monaco)

            if (containerRef.current && !editorRef.current) {
                editorRef.current = monaco.editor.create(containerRef.current, {
                    value: selectedFile.code,
                    language: "typescript",
                    theme: "github-dark-default",
                    wordWrap: "on",
                    minimap: { enabled: false },
                    suggestOnTriggerCharacters: true,
                    automaticLayout: true,
                    fontSize: 14,
                    padding: { top: 10, bottom: 10 },
                })

                const model = editorRef.current.getModel()

                model?.onDidChangeContent((e: Record<any, any>) => {
                    if (e?.detailedReasons[0]?.metadata?.source !== "setValue") {
                        //  keyboard change
                        setHasChangeCode(true)
                    }
                })
            }
        })()

        return () => {
            if (editorRef.current) {
                editorRef.current.dispose()
            }
        }
    }, [])

    useEffect(() => {
        if (editorRef.current && selectedFile.code) {
            const currentValue = editorRef.current.getValue()
            if (currentValue !== selectedFile.code) {
                editorRef.current.setValue(selectedFile.code)
            }
        }
    }, [selectedFile.code])

    return (
        <>
            <div ref={containerRef} className="h-full" />
            <SaveAlert editorRef={editorRef} toggleSaveAlert={toggleSaveAlert} hasChangeCode={hasChangeCode} />
        </>
    )
}
