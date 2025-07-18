import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

// Configure Coinbase Wallet connector to use Base Sepolia
export const cbWalletConnector = coinbaseWallet({
  appName: "OnlyPens",
  preference: "all",
});

// const isMainnet = process.env.NEXT_PUBLIC_BLOCKCHAIN_ENV === "mainnet";

export const config = createConfig({
  chains: [baseSepolia, base],
  // turn off injected provider discovery
  multiInjectedProviderDiscovery: false,
  connectors: [cbWalletConnector],
  ssr: true,
  transports: {
    [base.id]: http(
      `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    ),
    [baseSepolia.id]: http(
      `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    ),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
