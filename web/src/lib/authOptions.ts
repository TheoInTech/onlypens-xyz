import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { getCsrfToken } from "next-auth/react";
import { createPublicClient, http, Hex } from "viem";
import { baseSepolia, base } from "viem/chains";

const isMainnet = process.env.NEXT_PUBLIC_BLOCKCHAIN_ENV === "mainnet";
const CHAIN = isMainnet ? base : baseSepolia;

// Create a public client for signature verification
const publicClient = createPublicClient({
  chain: CHAIN,
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
          if (!credentials?.message || !credentials?.signature) {
            console.error("Missing message or signature");
            return null;
          }

          // Parse the SIWE message
          const siweMessage = new SiweMessage(JSON.parse(credentials.message));
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL!);

          // Get CSRF token
          const csrfToken = await getCsrfToken({
            req: { headers: req.headers },
          });

          // Basic SIWE checks
          if (siweMessage.nonce !== csrfToken) {
            console.error("Invalid nonce");
            return null;
          }

          if (siweMessage.domain !== nextAuthUrl.host) {
            console.error("Invalid domain");
            return null;
          }

          // Verify the signature using Base's recommended method
          try {
            const valid = await publicClient.verifyMessage({
              address: siweMessage.address as Hex,
              message: siweMessage.prepareMessage(),
              signature: credentials.signature as Hex,
            });

            console.log("Signature verification result:", valid);

            if (valid) {
              return {
                id: siweMessage.address,
              };
            }
          } catch (verifyError) {
            console.error("Error during signature verification:", verifyError);
          }

          return null;
        } catch (e) {
          console.error("Authorization error:", e);
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
