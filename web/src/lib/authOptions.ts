import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { getCsrfToken } from "next-auth/react";
import { createPublicClient, http, Hex } from "viem";
import { baseSepolia, base } from "viem/chains";

const isMainnet = process.env.NEXT_PUBLIC_BLOCKCHAIN_ENV === "mainnet";

// Create a public client for signature verification
const publicClient = createPublicClient({
  chain: isMainnet ? base : baseSepolia,
  transport: http(
    `https://base-${isMainnet ? "mainnet" : "sepolia"}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
  ),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Base",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          // For app router we need to get the CSRF token differently
          const csrfToken = await getCsrfToken({
            req: { headers: req.headers },
          });

          // Verify the nonce matches
          if (siwe.nonce !== csrfToken) {
            return null;
          }

          // Verify the domain matches
          if (siwe.domain !== nextAuthUrl.host) {
            return null;
          }

          // Verify the signature using Viem's verifyMessage which supports both EOA and EIP-1271
          const isValid = await publicClient.verifyMessage({
            address: siwe.address as Hex,
            message: siwe.prepareMessage(),
            signature: (credentials?.signature || "") as Hex,
          });

          if (isValid) {
            return {
              id: siwe.address,
            };
          }
          return null;
        } catch (e: unknown) {
          console.error(e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub;
      session.user.name = token.sub;
      session.user.image = "http://onlypens.xyz/assets/logo-icon.png";
      return session;
    },
  },
};
