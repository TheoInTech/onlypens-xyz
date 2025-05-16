"use client";

import React from "react";
import { Container, Text, Loader } from "@mantine/core";
import { useGlobalStore } from "@/stores";
import { OnboardingStep1 } from "@/app/(protected)/onboarding/step-1";
import { ERoles } from "@/stores/constants";
import { OnboardingStep2Ghostwriter } from "@/app/(protected)/onboarding/step-2-ghostwriter";
import { OnboardingStep2Creator } from "@/app/(protected)/onboarding/step-2-creator";
import { useSession } from "next-auth/react";

const OnboardingPage = () => {
  const { step, role } = useGlobalStore();
  const { status } = useSession();

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <Container
        p="sm"
        h="100%"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loader color="purple" />
        <Text>Fetching your profile...</Text>
      </Container>
    );
  }

  // Fallback in case session is not authenticated
  if (status === "unauthenticated") {
    return (
      <Container
        p="sm"
        h="100%"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Please connect your wallet and sign in to continue</Text>
      </Container>
    );
  }

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
