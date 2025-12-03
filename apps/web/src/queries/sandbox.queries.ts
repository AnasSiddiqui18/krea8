import { axios } from "@/lib/axios";
import { sendError, sendSuccess } from "@/lib/response";
import {
  getFilesFromSandboxSchema,
  getSandboxCreationStatusSchema,
  sandboxCreateSchema,
  updateFileInSandboxSchema,
} from "@/schema/schema";
import z from "zod";

export const sandbox = {
  create: async (updatedObj: Record<string, string>) => {
    try {
      const file = await axios.post(`/sandbox/create`, { files: updatedObj });
      const parsed = sandboxCreateSchema.safeParse(file.data);
      if (!parsed.success) {
        console.log(z.treeifyError(parsed.error));
        return sendError("invalid data received from server");
      }

      if (!parsed.data.success) return sendError("Failed to create sandbox");
      return sendSuccess(parsed.data);
    } catch (error) {
      console.log(`Failed to call /sandbox/create`, error);
      return sendError("Failed to call /sandbox/create");
    }
  },

  getCreationStatus: async (sbxId: string) => {
    try {
      const status = await axios.get(`/sandbox/status/${sbxId}`);

      const parsed = getSandboxCreationStatusSchema.safeParse(status.data);

      if (!parsed.success) {
        return sendError("Invalid response from /sandbox/status");
      }

      return sendSuccess(parsed.data);
    } catch (error) {
      console.log(`Failed to call /sandbox/status/${sbxId}`, error);
      return sendError("Failed to call /sandbox/status");
    }
  },

  getFile: async (filePath: string, sbxId: string) => {
    try {
      const file = await axios.get(
        `/sandbox/file/${sbxId}?filePath=${filePath}`,
      );

      const parsed = getFilesFromSandboxSchema.safeParse(file.data);

      if (!parsed.success)
        return (
          console.log(z.treeifyError(parsed.error)),
          sendError("Invalid response from /sandbox/file")
        );

      if (!parsed.data.success) return sendError("Failed to get file");

      return sendSuccess(parsed.data);
    } catch (error) {
      console.log(`Failed to call /sandbox/file/${sbxId}`, error);
      return sendError("Failed to call /sandbox/file");
    }
  },

  updateFile: async (filePath: string, sbxId: string, content: string) => {
    try {
      const response = await axios.patch(
        `/sandbox/file/${sbxId}?filePath=${filePath}`,
        { content },
      );

      const parsed = updateFileInSandboxSchema.safeParse(response.data);

      if (!parsed.success) {
        return sendError("Invalid response from update file");
      }

      return sendSuccess(parsed.data);
    } catch (error) {
      console.log(`Failed to update file /sandbox/file/${sbxId}`, error);
      return sendError("Failed to call /sandbox/file");
    }
  },
};
