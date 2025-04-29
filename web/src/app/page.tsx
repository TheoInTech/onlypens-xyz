import React from "react";
import { Stack, Title, Text, Box, Container, Group } from "@mantine/core";
import Image from "next/image";
import classes from "./home.module.css";

const HomePage = () => {
  return (
    <Box className={classes.home}>
      <Container
        size="md"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          align="center"
          justify="center"
          gap="sm"
          style={{ width: "100%" }}
        >
          <Group gap="0">
            <Image
              src="/assets/logo-icon.png"
              alt="Logo"
              width={80}
              height={80}
            />
            <Title
              order={1}
              c="white"
              style={{
                fontFamily: "Manrope",
                fontSize: "2rem",
                textAlign: "center",
              }}
            >
              OnlyPens
            </Title>
          </Group>
          <Title
            order={2}
            c="white"
            style={{
              fontWeight: 500,
              fontSize: "1.5rem",
              textAlign: "center",
              fontFamily: "Inter",
            }}
          >
            Hire the voice behind the fame
          </Title>
          <Group align="center" gap="xs" mt="md">
            <Text c="gray.6" size="xl" fw={400} style={{ textAlign: "center" }}>
              Coming soon on
            </Text>
            <Box
              bg="white"
              p="4px"
              style={{
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src="/assets/Base_Wordmark_Blue.svg"
                alt="Base"
                width={60}
                height={15}
              />
            </Box>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;
