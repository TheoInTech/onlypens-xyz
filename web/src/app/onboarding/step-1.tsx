import React from "react";
import { Title, Text, Stack, Group } from "@mantine/core";
import { RoleSwitch } from "./role-switch";
import { Button } from "@/components";
import { IconArrowNarrowRightDashed } from "@tabler/icons-react";
import classes from "./onboarding.module.css";
import { useGlobalStore } from "@/stores";

export const OnboardingStep1 = () => {
  const { setStep } = useGlobalStore();

  const handleProceed = () => {
    setStep(2);
  };

  return (
    <Stack gap="xl" align="center" justify="center" h="100%">
      <Title order={1} fw={500}>
        How would you like to use{" "}
        <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
          OnlyPens
        </Text>
        ?
      </Title>
      <Group gap="xl">
        <RoleSwitch />
        <Button
          variant="secondary"
          size="small"
          rightSection={<IconArrowNarrowRightDashed />}
          onClick={handleProceed}
        >
          Proceed
        </Button>
      </Group>
      <Stack className={classes.tilesContainer}>
        Different tiles here that changes based on selected role
      </Stack>
    </Stack>
  );
};
