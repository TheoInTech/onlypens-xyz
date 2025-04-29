"use client";

import {
  Burger,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Image from "next/image";
import classes from "./menu.module.css";
import Link from "next/link";
import { ConnectWallet } from "@/components/connect-wallet";

export function Menu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);

  return (
    <>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Group>
            <Image
              src="/assets/logo-icon.png"
              alt="OnlyPens Logo"
              width={500}
              height={500}
              className={classes.logo}
            />
            <Text className={classes.logoText}>OnlyPens</Text>
          </Group>

          <Group h="100%" gap={0} visibleFrom="sm">
            <Link href="/about" className={classes.link}>
              About OnlyPens
            </Link>
          </Group>

          <ConnectWallet size="small" />
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
            color="white"
          />
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
