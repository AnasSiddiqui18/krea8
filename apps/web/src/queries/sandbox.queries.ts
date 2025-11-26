import { axios } from "@/lib/axios";

export const sandbox = {
  create: async (updatedObj: Record<string, string>) => {
    try {
      const file = await axios.post(`/sandbox/create`, { files: updatedObj });
      return file.data;
    } catch (error) {
      console.log(`Failed to call /sandbox/create`, error);
      return null;
    }
  },

  getCreationStatus: async (sbxId: string) => {
    try {
      const status = await axios.get(`/sandbox/status/${sbxId}`);
      return status.data;
    } catch (error) {
      console.log(`Failed to call /sandbox/status`, error);
      return null;
    }
  },

  getFile: async (filePath: string, sbxId: string) => {
    try {
      const file = await axios.get(
        `/sandbox/file/${sbxId}?filePath=${filePath}`,
      );
      return file.data;
    } catch (error) {
      console.log(`Failed to call /sandbox/file/${sbxId}`, error);
      return null;
    }
  },

  updateFile: async (filePath: string, sbxId: string, content: string) => {
    try {
      const file = await axios.patch(
        `/sandbox/file/${sbxId}?filePath=${filePath}`,
        { content },
      );

      console.log("patch response", file.data);
    } catch (error) {
      console.log(`Failed to call /sandbox/file/${sbxId}`, error);
      return null;
    }
  },
};
