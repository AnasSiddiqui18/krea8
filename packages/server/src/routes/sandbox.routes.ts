import { Hono } from "hono";
import {
  createFolderTree,
  getAvailablePort,
  getFile,
  getProjectStructure,
  updateFile,
  updateOrCreateFiles,
} from "@/helpers/helpers";
import { Sandbox } from "@/docker/sandbox";
import { streamObject } from "ai";
import { model } from "@/lib/ai/google";
import { updateWebsitePrompt } from "@/lib/prompt";
import { mockFiles, NextTemplate } from "data";
import { websiteUpdateSchema } from "@/lib/schema/schema";

export const sandboxRouter = new Hono();

let sbxId = "";

const activeContainers = new Map<
  string,
  {
    isServerReady: boolean;
    hasError: boolean;
    errorMessage: string | null;
    port: string;
  }
>();

const images = {
  node: "node:25-alpine3.21",
};

sandboxRouter.post("/create", async (c) => {
  try {
    const { files } = await c.req.json();

    const portRes = await getAvailablePort();

    if (!portRes.success) {
      return c.json({
        success: false,
        message: "Failed to get port",
      });
    }

    const { data: port } = portRes;

    const sandbox = new Sandbox(String(port), activeContainers);

    const imageName = images["node"];
    sbxId = crypto.randomUUID();

    activeContainers.set(sbxId, {
      isServerReady: false,
      errorMessage: null,
      port: port.toString(),
      hasError: false,
    });

    console.log("saving files to disk");

    const response = await createFolderTree(sbxId, files);

    if (!response.success) {
      return c.json({
        message: "failed to save files on disk",
      });
    }

    sandbox.getOrPullImage(imageName, sbxId);

    return c.json({
      success: true,
      message: "Sandbox created successfully",
      sbxId,
    });
  } catch (error) {
    return c.json({ success: false, message: "Failed to create sandbox" });
  }
});

sandboxRouter.get("/status/:sbxId", async (c) => {
  try {
    const { sbxId } = c.req.param();

    const containerInfo = activeContainers.get(sbxId);

    if (!containerInfo) {
      return c.json({
        status: "failed",
        message: "Sandbox not found",
        server_url: null,
      });
    }

    const { errorMessage, hasError, isServerReady } = containerInfo;

    if (hasError)
      return c.json({
        status: "failed",
        message: errorMessage,
        server_url: null,
      });

    if (!isServerReady) {
      return c.json({
        status: "progress",
        server_url: null,
      });
    }

    // TODO only update the isServerReady when the server is fully ready

    return c.json({
      status: "completed",
      server_url: `http://localhost:${containerInfo.port}`,
    });
  } catch (error) {
    console.error("Failed to spin sandbox");
    return c.json({
      status: "failed",
      message: "Failed to spin sandbox",
      server_url: null,
    });
  }
});

sandboxRouter.get("/file/:sbxId", async (c) => {
  try {
    const { filePath } = c.req.query();
    const { sbxId } = c.req.param();

    if (!filePath || !sbxId) {
      return c.json({
        message: "file and sandbox id is required",
      });
    }

    const response = await getFile(filePath, sbxId);

    if (!response.success) {
      return c.json({
        message: "failed to get file",
        success: false,
      });
    }

    return c.json(response);
  } catch (error) {
    return c.json({
      message: "failed to get file",
      success: false,
    });
  }
});

// updating manually

sandboxRouter.patch("/file/:sbxId", async (c) => {
  try {
    const { sbxId } = c.req.param();
    const { filePath } = c.req.query();
    const { content } = await c.req.json();

    if (!filePath || !sbxId || !content) {
      return c.json({
        sucess: false,
        message: "failed to update file",
      });
    }

    const updateRes = await updateFile(filePath, content, sbxId);

    if (!updateRes.success) {
      return c.json({
        sucess: false,
        message: "failed to update file",
      });
    }

    return c.json({
      sucess: true,
      message: "file updated successfully",
    });
  } catch (error) {
    return c.json({
      sucess: false,
      message: "failed to update file",
    });
  }
});
