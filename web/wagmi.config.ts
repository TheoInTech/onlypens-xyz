import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { OnlyPensABI } from "@/lib/abi";
import { Abi } from "viem";
import { base } from "viem/chains";

export default defineConfig({
  out: "src/hooks/abi-generated.ts",
  contracts: [
    {
      name: "OnlyPens",
      abi: OnlyPensABI as Abi,
      address: {
        [base.id]: "0x88566d8202EaD5a6D6b96E4a37A1D197f0d94BC4",
        // [baseSepolia.id]: "0x8d7c222d2F0D8bf9ceFbA02Cd01ab46C47C33062",
      },
    },
  ],
  plugins: [
    // etherscan({
    //   apiKey: process.env.ETHERSCAN_API_KEY!,
    //   chainId:
    //     process.env.NEXT_PUBLIC_BLOCKCHAIN_ENV === "mainnet"
    //       ? base.id
    //       : baseSepolia.id,
    //   contracts: [
    //     {
    //       name: "EnsRegistry",
    //       address: {
    //         [base.id]: "0x314159265dd8dbb310642f98f50c066173c1259b",
    //         [baseSepolia.id]: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    //       },
    //     },
    //   ],
    // }),
    react(),
  ],
});
