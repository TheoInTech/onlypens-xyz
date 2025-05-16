import React from "react";
import { Stack, Text } from "@mantine/core";
import Image from "next/image";
import classes from "./home.module.css";
import { ConnectWallet } from "@/components";

const HomePage = () => {
  return (
    <Stack className={classes.home}>
      <Stack className={classes.wrapper}>
        <Image
          src="/assets/logo-icon.png"
          alt="Logo"
          width={120}
          height={120}
        />
        <Text
          c="white"
          size="lg"
          fw={400}
          mb={16}
          style={{ textAlign: "center" }}
        >
          Connect your wallet to get started
        </Text>
        <ConnectWallet />
      </Stack>
    </Stack>
  );
};

export default HomePage;
