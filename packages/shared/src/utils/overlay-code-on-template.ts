import { NextTemplate } from "../constants/constants";
import { extractFilePath } from "./extract-file-path";
import { extractCodeContent } from "./extract-code-content";

export function overlayCodeOnTopOfTemplate(code: { rawFileBlock: string }[]) {
  const object = { ...NextTemplate };

  code.forEach((c) => {
    const { rawFileBlock } = c;

    const filePath = extractFilePath(rawFileBlock);

    if (!filePath) {
      console.error("failed to extract filePath");
      return null;
    }

    const code = extractCodeContent(rawFileBlock);

    if (code) object[filePath] = code;
  });

  return object;
}
