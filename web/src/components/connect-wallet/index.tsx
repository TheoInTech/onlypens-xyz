"use client";

import { useCallback, useEffect, useState } from "react";
import type { Hex } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useSignMessage,
} from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/lib/wagmi";
import Button from "@/components/button";
import { Group, Text } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { shortenAddress } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface IConnectWallet {
  size?: "default" | "small";
}

// Helper functions to set and delete cookies
const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

export const ConnectWallet = ({ size = "default" }: IConnectWallet) => {
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const { connect } = useConnect({
    mutation: {
      onSuccess: (data) => {
        const address = data.accounts[0];
        const chainId = data.chainId;
        const m = new SiweMessage({
          domain: document.location.host,
          address,
          chainId,
          uri: document.location.origin,
          version: "1",
          statement: "OnlyPens Smart Wallet",
          nonce: "12345678",
        });
        setMessage(m);
        signMessage({ message: m.prepareMessage() });
      },
    },
  });
  const account = useAccount();
  const client = usePublicClient();
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const { signMessage } = useSignMessage({
    mutation: { onSuccess: (sig) => setSignature(sig) },
  });
  const [message, setMessage] = useState<SiweMessage | undefined>(undefined);

  const checkValid = useCallback(async () => {
    if (!signature || !account.address || !client || !message) return;

    client.verifyMessage({
      address: account.address,
      message: message.prepareMessage(),
      signature,
    });
  }, [signature, account]);

  useEffect(() => {
    checkValid();
  }, [signature, account]);

  const handleConnect = async () => {
    if (account.isConnected) {
      await disconnect();
      deleteCookie("wallet-connected");
      deleteCookie("wallet-address");
    } else {
      await connect({ connector: cbWalletConnector });
    }
  };

  useEffect(() => {
    if (account.isConnected && account.address) {
      // Set cookies for middleware to use (24 hours expiry)
      setCookie("wallet-connected", "true", 60 * 60 * 24);
      setCookie("wallet-address", account.address, 60 * 60 * 24);

      // Navigate directly to onboarding instead of reloading
      router.push("/onboarding");
    }
  }, [account.isConnected, account.address, router]);

  return (
    <Button variant="secondary" onClick={handleConnect} size={size}>
      {account.isConnected && !!account.address ? (
        <Group>
          <Text size="xs">{shortenAddress(account.address)}</Text>
          <IconLogout size={24} />
        </Group>
      ) : (
        "Connect Smart Wallet"
      )}
    </Button>
  );
};
