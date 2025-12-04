import { useSnapshot } from "@/hooks/use-snapshot"
import { globalStore } from "@/store/global.store"
import { cn } from "@repo/ui/lib/utils"

type PreviewComponentProps = React.ComponentProps<"div">

export function PreviewComponent({ className, ...props }: PreviewComponentProps) {
    const { isPreviewLoading, server_url } = useSnapshot(globalStore)

    return (
        <div className={cn("h-full", true && "justify-center items-center", className)} {...props}>
            <iframe
                id="iframeEL"
                className={cn("h-full w-full hidden", !isPreviewLoading && "block")}
                src={server_url ?? ""}
            />
            <div className={cn("flex-col items-center justify-center gap-3 py-10 hidden", isPreviewLoading && "flex")}>
                <div className="relative">
                    <div className="h-7 w-7 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                </div>
                <div className="flex flex-col items-center text-center text-secondary-foreground">
                    <span className="animate-pulse">Initializing Preview, please wait</span>
                </div>
            </div>
        </div>
    )
}
