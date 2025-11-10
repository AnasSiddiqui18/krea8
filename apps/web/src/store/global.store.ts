import type { TreeNode } from "@/components/builder/tree-view-component";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

interface Store {
  initial_prompt: string | null;
  fileTree: TreeNode[];
  selectedFile: Partial<{
    code: string;
    path: string;
  }>;
  isPreviewLoading: boolean;
}

export const globalStore = proxy<Store>({
  initial_prompt: null,
  fileTree: [],
  selectedFile: {},
  isPreviewLoading: false,
});

devtools(globalStore);
