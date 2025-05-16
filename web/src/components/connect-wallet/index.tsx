"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/lib/wagmi";
import Button from "@/components/button";
import { Group, Menu, Text } from "@mantine/core";
import { IconCopy, IconLogout } from "@tabler/icons-react";
import { shortenAddress } from "@/lib/utils";
import classes from "./connect-wallet.module.css";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { baseSepolia } from "viem/chains";

interface IConnectWallet {
  size?: "default" | "small";
}

export const ConnectWallet = ({ size = "default" }: IConnectWallet) => {
  const { disconnect } = useDisconnect();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const { connect } = useConnect();
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: session } = useSession();

  const handleSignin = async () => {
    try {
      const callbackUrl = `/onboarding`;
      const message = new SiweMessage({
        domain: window.location.host,
        address: account.address,
        statement: "Sign in to OnlyPens.",
        uri: window.location.origin,
        version: "1",
        chainId: baseSepolia.id,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });
      signIn("credentials", {
        message: JSON.stringify(message),
        redirect: true,
        signature,
        callbackUrl,
      });
    } catch (error) {
      window.alert(error);
    }
  };

  const handleConnect = async () => {
    await connect({ connector: cbWalletConnector });
    setMenuOpen(false);
  };

  const handleDisconnect = async () => {
    await disconnect();
    await signOut({ redirect: true, callbackUrl: "/" });
    setMenuOpen(false);
  };

  const handleCopyAddress = () => {
    if (account.address) {
      navigator.clipboard.writeText(account.address);
    }
  };

  // Connected but not signed in
  if (account.isConnected && !!account.address && !session) {
    return (
      <Button variant="secondary" onClick={handleSignin} size={size}>
        Sign in
      </Button>
    );
  }

  // Connected and signed in
  if (account.isConnected && !!account.address && !!session) {
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

  // Not connected
  return (
    <Button variant="secondary" onClick={handleConnect} size={size}>
      Connect Smart Wallet
    </Button>
  );
};
