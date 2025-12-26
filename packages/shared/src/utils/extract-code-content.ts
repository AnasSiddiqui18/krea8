export const extractCodeContent = (content: string) =>
  content.match(/<krea8file[^>]*>([\s\S]*?)<\/krea8file>/)?.[1];
