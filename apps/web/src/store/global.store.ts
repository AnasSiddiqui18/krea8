import type { TreeNode } from "@/components/builder/tree-view-component";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

export interface Chat {
  role: "assistant" | "user";
  content: string;
}

interface Store {
  initial_prompt: string | null;
  fileTree: TreeNode[];
  template: string | null;
  selectedFile: Partial<{
    code: string;
    path: string;
  }>;
}

export const globalStore = proxy<Store>({
  initial_prompt: null,
  fileTree: [],
  template: null,
  selectedFile: {},
});

devtools(globalStore);
