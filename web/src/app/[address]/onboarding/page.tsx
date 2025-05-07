"use client";

import React from "react";
import { Container, Group } from "@mantine/core";
import { useGlobalStore } from "@/stores";
import { OnboardingStep1 } from "@/app/[address]/onboarding/step-1";
import { OnboardingStep2 } from "@/app/[address]/onboarding/step-2";
import { Button } from "@/components";
import { IconArrowLeftDashed, IconArrowRightDashed } from "@tabler/icons-react";
import classes from "./onboarding.module.css";

const OnboardingPage = () => {
  const { step, setStep } = useGlobalStore();

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  return (
    <Container p="sm" h="100%">
      {step === 1 && <OnboardingStep1 />}
      {step === 2 && <OnboardingStep2 />}

      {step > 1 && (
        <Group
          className={classes.buttonGroup}
          w="100%"
          justify={"space-between"}
          align="center"
        >
          <Button
            variant="ghost"
            size="small"
            leftSection={<IconArrowLeftDashed />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="small"
            rightSection={<IconArrowRightDashed />}
            onClick={handleNext}
          >
            Next
          </Button>
        </Group>
      )}
    </Container>
  );
};

export default OnboardingPage;
