"use client";

import { Provider } from "@ai-sdk-tools/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

const queryClient = new QueryClient();

interface TanstackQueryProviderProps {
  children: ReactNode;
}

export function TanstackQueryProvider({
  children,
}: TanstackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider initialMessages={[]}>{children}</Provider>
    </QueryClientProvider>
  );
}
