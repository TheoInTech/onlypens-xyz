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
import { Group, Menu, Text } from "@mantine/core";
import { IconCopy, IconLogout } from "@tabler/icons-react";
import { shortenAddress } from "@/lib/utils";
import { useRouter } from "next/navigation";
import classes from "./connect-wallet.module.css";

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
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

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
    await connect({ connector: cbWalletConnector });
    setMenuOpen(false);
  };

  useEffect(() => {
    setMenuOpen(false);

    if (account.isConnected && account.address) {
      // Set cookies for middleware to use (24 hours expiry)
      setCookie("wallet-connected", "true", 60 * 60 * 24);
      setCookie("wallet-address", account.address, 60 * 60 * 24);

      // Navigate directly to onboarding instead of reloading
      router.push("/onboarding");
    } else if (!account.isConnected) {
      // If wallet disconnects, redirect back to home page
      deleteCookie("wallet-connected");
      deleteCookie("wallet-address");
      router.push("/");
    }
  }, [account.isConnected, account.address, router]);

  const handleDisconnect = async () => {
    await disconnect();
    deleteCookie("wallet-connected");
    deleteCookie("wallet-address");
    setMenuOpen(false);
  };

  const handleCopyAddress = () => {
    if (account.address) {
      navigator.clipboard.writeText(account.address);
    }
  };

  if (account.isConnected && !!account.address) {
    return (
      <Menu
        opened={menuOpen}
        onChange={setMenuOpen}
        position="bottom-end"
        offset={4}
        shadow="md"
        width={200}
        radius="md"
        withinPortal
        zIndex={99999999}
      >
        <Menu.Target>
          <Button variant="secondary" size={size}>
            <Group gap="xs">
              <Text size="xs">{shortenAddress(account.address)}</Text>
              <IconLogout size={16} />
            </Group>
          </Button>
        </Menu.Target>

        <Menu.Dropdown className={classes.menuDropdown}>
          <Menu.Item
            onClick={handleCopyAddress}
            className={classes.menuItem}
            rightSection={<IconCopy size={12} />}
          >
            Copy Address
          </Menu.Item>
          <Menu.Item
            onClick={handleDisconnect}
            className={classes.menuItem}
            rightSection={<IconLogout size={12} />}
          >
            Disconnect
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Button variant="secondary" onClick={handleConnect} size={size}>
      Connect Smart Wallet
    </Button>
  );
};
