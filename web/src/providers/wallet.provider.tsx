"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { SessionProvider } from "next-auth/react";

import { config } from "@/lib/wagmi";

export function WalletProvider(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{props.children}</SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
