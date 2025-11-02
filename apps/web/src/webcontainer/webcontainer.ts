import { WebContainer } from "@webcontainer/api";

export class WebContainerClass {
  private static webcontainer: WebContainer;

  public static async getWebContainer() {
    if (!this.webcontainer) {
      const wc = await WebContainer.boot();
      this.webcontainer = wc;
      return wc;
    }

    return this.webcontainer;
  }
}
