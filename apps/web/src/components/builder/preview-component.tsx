import { useSnapshot } from "@/hooks/use-snapshot";
import { convertFiles, setupWebContainer } from "@/shared/shared";
import { globalStore } from "@/store/global.store";
import { cn } from "@repo/ui/lib/utils";
import { useEffect } from "react";

type PreviewComponentProps = React.ComponentProps<"div">;

export function PreviewComponent({
  className,
  ...props
}: PreviewComponentProps) {
  const { template } = useSnapshot(globalStore);

  useEffect(() => {
    async function setup() {
      if (!template) return;

      console.log("parsing template...");

      const parsedJson = JSON.parse(template);

      if (!parsedJson.template.files) {
        console.error("files not found returning...");
        return;
      }

      console.log("template files", parsedJson.template.files);

      const structuredFiles = convertFiles(parsedJson.template.files);
      console.log("structuredFiles", structuredFiles);

      await setupWebContainer(structuredFiles);

      console.log("coverting files to tree", structuredFiles);
    }

    setup();
  }, [template]);

  return (
    <div className={cn("h-full", className)} {...props}>
      <iframe id="iframeEL" className="h-full w-full"></iframe>
    </div>
  );
}
