import type { TreeNode } from "@/components/builder/tree-view-component";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

export interface Chat {
  role: "assistant" | "user";
  content: {
    type?: string;
    message: string;
  };
  isThinking?: boolean;
}

interface Store {
  initial_prompt: string | null;
  chat: Chat[];
  fileTree: TreeNode[];
}

export const globalStore = proxy<Store>({
  initial_prompt: null,
  chat: [],
  fileTree: [],
});

devtools(globalStore);
