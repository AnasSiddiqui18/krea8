import type { JsonifiedClient } from "@orpc/openapi-client";
import type { ContractRouterClient } from "@orpc/contract";
import { createORPCClient, onError } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { contract } from "@repo/server/contract.ts";

const link = new OpenAPILink(contract, {
  url: `${process.env.NEXT_PUBLIC_SERVER_URL}/api`,
  fetch: (request, init) => {
    return globalThis.fetch(request, {
      ...init,
      // credentials: "include",
    });
  },
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const orpcClient: JsonifiedClient<
  ContractRouterClient<typeof contract>
> = createORPCClient(link);
