"use client";

import React from "react";
import { Container } from "@mantine/core";
import { useGlobalStore } from "@/stores";
import { OnboardingStep1 } from "@/app/[address]/onboarding/step-1";
import { ERoles } from "@/stores/constants";
import { OnboardingStep2Ghostwriter } from "@/app/[address]/onboarding/step-2-ghostwriter";
import { OnboardingStep2Creator } from "@/app/[address]/onboarding/step-2-creator";

const OnboardingPage = () => {
  const { step, role } = useGlobalStore();

  return (
    <Container p="sm" h="100%">
      {step === 1 && <OnboardingStep1 />}
      {step === 2 && role === ERoles.GHOSTWRITER && (
        <OnboardingStep2Ghostwriter />
      )}
      {step === 2 && role === ERoles.CREATOR && <OnboardingStep2Creator />}
    </Container>
  );
};

export default OnboardingPage;
