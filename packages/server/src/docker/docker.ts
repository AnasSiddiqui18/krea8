import Docker from "dockerode";

export const docker = new Docker({
  socketPath: "/home/anas/.docker/desktop/docker.sock",
});
