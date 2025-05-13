"use client";

import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { WagmiProvider, useAccount, useChainId, useConfig } from "wagmi";
import { SessionProvider } from "next-auth/react";
import { config } from "@/lib/wagmi";
import { baseSepolia } from "wagmi/chains";
import { switchChain } from "wagmi/actions";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

// Network validator component
function NetworkValidator({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wagmiConfig = useConfig();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [networkSwitchAttempted, setNetworkSwitchAttempted] = useState(false);

  useEffect(() => {
    // Only check network if wallet is connected
    if (isConnected) {
      console.log(
        `Connected to chain ID: ${chainId}, Base Sepolia ID: ${baseSepolia.id}`
      );

      if (chainId !== baseSepolia.id) {
        setIsCorrectNetwork(false);

        // Auto-switch to the correct network
        const switchToCorrectNetwork = async () => {
          try {
            console.log("Attempting to switch to Base Sepolia...");
            setNetworkSwitchAttempted(true);
            await switchChain(wagmiConfig, { chainId: baseSepolia.id });
            console.log("Successfully switched to Base Sepolia");
            setIsCorrectNetwork(true);
          } catch (error) {
            console.error("Failed to switch network:", error);
            // Network switch failed - user will need to switch manually
          }
        };

        if (!networkSwitchAttempted) {
          switchToCorrectNetwork();
        }
      } else if (chainId === baseSepolia.id) {
        console.log("Already connected to Base Sepolia");
        setIsCorrectNetwork(true);
      }
    }
  }, [isConnected, chainId, wagmiConfig, networkSwitchAttempted]);

  // Return children with a network warning banner if needed
  return (
    <>
      {isConnected && !isCorrectNetwork && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: "#FF4D4F",
            color: "white",
            padding: "8px 16px",
            textAlign: "center",
            zIndex: 1000,
            fontSize: "14px",
          }}
        >
          Please switch to Base Sepolia network (Chain ID: {baseSepolia.id}).
          Currently connected to Chain ID: {chainId}.
        </div>
      )}
      {children}
    </>
  );
}

export function WalletProvider(props: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NetworkValidator>{props.children}</NetworkValidator>
        </SessionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
