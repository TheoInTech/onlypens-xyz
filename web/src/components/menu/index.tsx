"use client";

import {
  Burger,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import classes from "./menu.module.css";
import Link from "next/link";
import { ConnectWallet } from "@/components";
import { useAccount } from "wagmi";

export function Menu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const account = useAccount();
  const profile = false; // TODO: get profile from Supabase

  return (
    <>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <UnstyledButton
            component={Link}
            className={classes.buttonLogo}
            href="/about"
          >
            <Image
              src="/assets/logo-icon.png"
              alt="OnlyPens Logo"
              width={500}
              height={500}
              className={classes.logo}
            />
            <Text className={classes.logoText}>OnlyPens</Text>
          </UnstyledButton>

          <Group gap={"xl"} visibleFrom="sm">
            <Group h="100%" gap={"sm"} visibleFrom="sm">
              <Link href="/about" className={classes.link}>
                About OnlyPens
              </Link>

              {account.isConnected && account.address && !profile && (
                <Link href="/onboarding" className={classes.link}>
                  Onboarding
                </Link>
              )}

              {account.isConnected && account.address && profile && (
                <>
                  <Link href="/dashboard" className={classes.link}>
                    Dashboard
                  </Link>
                  <Link href="/gigs" className={classes.link}>
                    My Gigs
                  </Link>
                  <Link href="/profile" className={classes.link}>
                    Profile
                  </Link>
                </>
              )}
            </Group>

            <ConnectWallet size="small" />
            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              hiddenFrom="sm"
              color="white"
            />
          </Group>
        </Group>
      </header>

      <Drawer.Root
        opened={drawerOpened}
        onClose={closeDrawer}
        zIndex={100000000}
      >
        <Drawer.Overlay bg="rgba(0, 0, 0, 0.25)" />
        <Drawer.Content bg="midnight.9">
          <Drawer.Header bg="midnight.9">
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <ScrollArea h="calc(100vh - 80px" mx="-md">
              <Link href="/about" className={classes.link}>
                About OnlyPens
              </Link>

              <Divider my="sm" />

              <ConnectWallet size="small" />
            </ScrollArea>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
