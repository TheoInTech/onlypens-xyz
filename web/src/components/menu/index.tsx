"use client";

import {
  Box,
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
import cx from "clsx";
import { usePathname } from "next/navigation";
import { useGlobalStore } from "@/stores";

export function Menu() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const pathname = usePathname();
  const account = useAccount();
  const { user } = useGlobalStore();

  return (
    <>
      <Box className={classes.banner}>
        SmartWallet is still being fixed for signing. Please use Coinbase wallet
        for now.
      </Box>
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
            <Group h="100%" gap={"lg"} visibleFrom="sm">
              <Link
                href="/about"
                className={cx(
                  classes.link,
                  pathname.includes("/about") && classes.linkActive
                )}
              >
                About OnlyPens
              </Link>

              {account.isConnected && account.address && !user && (
                <Link
                  href={`/onboarding`}
                  className={cx(
                    classes.link,
                    pathname === `/onboarding` && classes.linkActive
                  )}
                >
                  Onboarding
                </Link>
              )}

              {account.isConnected && account.address && !!user && (
                <>
                  <Link
                    href={`/dashboard`}
                    className={cx(
                      classes.link,
                      pathname.includes(`/dashboard`) && classes.linkActive
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/gigs`}
                    className={cx(
                      classes.link,
                      pathname.includes(`/gigs`) && classes.linkActive
                    )}
                  >
                    My Gigs
                  </Link>
                  <Link
                    href={`/profile`}
                    className={cx(
                      classes.link,
                      pathname.includes(`/profile`) && classes.linkActive
                    )}
                  >
                    Profile
                  </Link>
                </>
              )}
            </Group>

            {!!user && (
              <Group className={classes.role}>
                <Box className={classes.roleIndicator} />
                {user.role}
              </Group>
            )}

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
              <Link
                href="/about"
                className={cx(
                  classes.link,
                  pathname.includes("/about") && classes.linkActive
                )}
              >
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
