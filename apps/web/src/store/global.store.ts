import type { TreeNode } from "@/components/builder/tree-view-component";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

interface Store {
  initial_prompt: string | null;
  fileTree: TreeNode[];
  selectedFile: Partial<{
    code: string;
    path: string;
    parentFolders: string[];
    id: string;
  }>;
  isPreviewLoading: boolean;
  sbxId: string | null;
  filesGenerated: {
    name: string;
    action: "updated" | "created";
    path: string;
  }[];
}

export const globalStore = proxy<Store>({
  initial_prompt: null,
  fileTree: [],
  filesGenerated: [],
  selectedFile: {},
  isPreviewLoading: false,
  sbxId: null,
});

devtools(globalStore);
