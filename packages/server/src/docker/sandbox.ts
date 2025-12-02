import crypto from "crypto";
import { docker } from "./docker";
import { createFolderTree } from "@/helpers/helpers";
import { mockFiles } from "data";

export class Sandbox {
  docker: typeof docker;
  port: string;
  activeContainers: Map<
    string,
    {
      isServerReady: boolean;
      hasError: boolean;
      errorMessage: string | null;
      port: string;
    }
  >;

  constructor(
    port: string,
    activeContainers: Map<
      string,
      {
        isServerReady: boolean;
        hasError: boolean;
        errorMessage: string | null;
        port: string;
      }
    >,
  ) {
    this.docker = docker;
    this.port = port;
    this.activeContainers = activeContainers;
  }

  async getOrPullImage(imageName: string, sbxId: string) {
    try {
      const image = this.docker.getImage(imageName);
      await image.inspect();

      await this.spinContainer(imageName, sbxId);
    } catch (error) {
      console.log("image not found pulling");

      await this.docker.pull(imageName, (err: any, stream: any) => {
        if (err) {
          const error = err.message ?? err;

          console.log("failed to pull image::", error);
        }

        this.docker.modem.followProgress(stream, async () => {
          console.log("image pulled. spinning up the container");
          await this.spinContainer(imageName, sbxId);
        });
      });
    }
  }

  async spinContainer(imageName: string, sbxId: string) {
    const prev = this.activeContainers.get(sbxId)!;

    try {
      const container = await this.docker.createContainer({
        Image: imageName,
        Tty: false,
        OpenStdin: true,
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        WorkingDir: "/app",
        name: `next-container-${crypto.randomUUID()}`,
        HostConfig: {
          Binds: [
            `/home/anas/projects/krea8/krea8/packages/server/sandboxes/sandbox-${sbxId}:/app`,
          ],
          PortBindings: {
            [`${this.port}/tcp`]: [{ HostPort: this.port }],
          },
        },
      });

      console.log("starting container");

      await container.start();

      const containerInfo = await container.inspect();
      console.log("Container Status:", containerInfo.State.Status);
      console.log("Container Running:", containerInfo.State.Running);
      console.log("Container Health:", containerInfo.State.Health?.Status);

      {
        console.log("Installing deps");

        const exec = await container.exec({
          Cmd: ["npm", "install", "--loglevel=info", "--no-progress"],
          WorkingDir: "/app",
          AttachStdout: true,
          AttachStderr: true,
        });

        const stream = await exec.start({ hijack: false });
        container.modem.demuxStream(stream, process.stdout, process.stderr);

        await new Promise((resolve, reject) => {
          stream.on("end", () => {
            console.log("Deps installed successfully");
            resolve(true);
          });
          stream.on("close", () => {
            console.log("closing intallation");
            resolve(true);
          });
          stream.on("data", () => {});
          stream.on("error", (e: any) => {
            console.log("error::", e);
            reject(e);
          });
        });
      }

      {
        console.log("Running dev server");

        const exec = await container.exec({
          Cmd: ["npm", "run", "dev"],
          WorkingDir: "/app",
          AttachStdout: true,
          AttachStderr: true,
        });

        const stream = await exec.start({ hijack: false });
        container.modem.demuxStream(stream, process.stdout, process.stderr);

        this.activeContainers.set(sbxId, {
          ...prev,
          isServerReady: true,
        });

        await new Promise((_, reject) => {
          stream.on("data", () => {});
          stream.on("error", (e: any) => {
            console.log("failed to run dev server::", e);
            reject(e);
          });
        });

        console.log("Dev server is running!!");
      }
    } catch (error: any) {
      console.log("failed to spin up container", error);
      this.activeContainers.set(sbxId, {
        ...prev,
        isServerReady: true,
        hasError: true,
        errorMessage: String(
          "message" in error ? error?.message : "Failed to spin sandbox",
        ),
      });
    }
  }
}

// new Sandbox("3000", new Map()).spinContainer(
//   "node:25-alpine3.21",
//   "ec586da8-a9d8-466e-9117-79e47058d4e3",
// );
