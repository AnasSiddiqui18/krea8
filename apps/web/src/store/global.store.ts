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
}

export const globalStore = proxy<Store>({
  initial_prompt: null,
  chat: [],
});

devtools(globalStore);
