import React from "react";
import { Stack, Text } from "@mantine/core";
import Image from "next/image";
import classes from "./home.module.css";
import { ConnectWallet } from "@/components";

const HomePage = () => {
  return (
    <Stack className={classes.home}>
      {/* <Stack className={classes.wrapper}>
        <Group gap="0">
          <Image
            src="/assets/logo-icon.png"
            alt="Logo"
            width={56}
            height={56}
          />
          <Title
            order={1}
            c="white"
            fw={800}
            size="lg"
            style={{
              fontFamily: "Manrope",
              textAlign: "center",
            }}
          >
            OnlyPens
          </Title>
        </Group>
        <Title
          order={2}
          c="midnight.1"
          fw={400}
          size="md"
          style={{
            textAlign: "center",
            fontFamily: "Inter",
          }}
        >
          Hire the voice behind the fame
        </Title>
      </Stack> */}
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
