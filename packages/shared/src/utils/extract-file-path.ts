export const extractFilePath = (content: string) =>
  content.match(/path="([^"]+)"/)?.[1];
