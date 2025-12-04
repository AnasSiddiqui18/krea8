import { Button } from "@repo/ui/components/button"
import { TriangleAlert } from "lucide-react"
import type { editor } from "monaco-editor-core"
import type { RefObject } from "react"
import { motion } from "framer-motion"
import { useSnapshot } from "@/hooks/use-snapshot"
import { globalStore } from "@/store/global.store"
import { sandbox } from "@/queries/sandbox.queries"

export function SaveAlert({
    editorRef,
    toggleSaveAlert,
    hasChangeCode,
}: {
    editorRef: RefObject<editor.IStandaloneCodeEditor | null>
    toggleSaveAlert: () => void
    hasChangeCode: boolean
}) {
    const { selectedFile, sbxId } = useSnapshot(globalStore)

    function resetChanges() {
        const code = globalStore.selectedFile.code

        if (!editorRef.current || !code) {
            console.error("Editor ref not found")
            return
        }

        editorRef.current.setValue(code)
        toggleSaveAlert()
    }

    async function saveChange() {
        try {
            const filePath = selectedFile.path
            const updatedCode = editorRef.current?.getValue()

            if (!filePath || !updatedCode || !sbxId)
                return console.error("File path OR sandbox id OR current code not found")

            globalStore.selectedFile.code = updatedCode

            const updateResponse = await sandbox.updateFile(filePath, sbxId, updatedCode)

            if (!updateResponse.success) {
                console.log("Failed to update file")
                return
            }

            toggleSaveAlert()
        } catch (error) {
            console.error("failed to save file inside wc")
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate={hasChangeCode ? "visible" : "hidden"}
            variants={{
                hidden: {
                    opacity: 0,
                    y: 20,
                    scale: 0.8,
                    transition: {
                        duration: 0.3,
                        ease: "easeInOut",
                    },
                },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        duration: 0.4,
                        ease: "backOut",
                    },
                },
            }}
            className="absolute bottom-24 inset-x-0 mx-auto flex w-full max-w-sm items-center justify-between rounded-xl bg-secondary/90 backdrop-blur-md px-5 py-3 shadow-lg border border-border"
        >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <TriangleAlert className="h-4 w-4 text-yellow-500" />
                <span>Unsaved changes</span>
            </div>

            <div className="flex items-center gap-3">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-4 rounded-md text-sm font-medium transition-all hover:scale-105"
                    onClick={resetChanges}
                >
                    Reset
                </Button>
                <Button
                    size="sm"
                    className="h-8 px-4 rounded-md text-sm font-medium transition-all bg-primary text-primary-foreground hover:scale-105 hover:shadow-md"
                    onClick={saveChange}
                >
                    Save
                </Button>
            </div>
        </motion.div>
    )
}
