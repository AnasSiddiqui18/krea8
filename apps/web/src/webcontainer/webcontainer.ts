import { WebContainer } from "@webcontainer/api"

export class WebContainerClass {
    private static webcontainer: WebContainer

    public static async getWebContainer() {
        if (!this.webcontainer) {
            const wc = await WebContainer.boot()
            this.webcontainer = wc
            return wc
        }

        return this.webcontainer
    }

    public static async getFile(filePath: string) {
        try {
            const wc = await this.getWebContainer()
            const file = await wc.fs.readFile(filePath, "utf-8")
            return file
        } catch (error) {
            console.error("Failed to get files", error)
        }
    }
}
