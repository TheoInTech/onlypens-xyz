"use client";

import {
  Stack,
  Title,
  Text,
  Tabs,
  InputLabel,
  Group,
  Loader,
  Modal,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Button, Input, Textarea } from "@/components";
import {
  IconArrowLeftDashed,
  IconArrowRightDashed,
  IconNumber1,
  IconNumber2,
  IconNumber3,
} from "@tabler/icons-react";
import classes from "./step-2.module.css";
import { useCheckboxGroup } from "@/hooks/useCheckboxGroup";
import { zodResolver } from "@mantine/form";
import { UserSchema } from "@/schema/user.schema";
import { useGlobalStore } from "@/stores";
import { DefaultGhostwriterForm, IUser } from "@/schema/user.schema";
import { useForm } from "@mantine/form";
import useOnboarding from "@/hooks/useOnboarding";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { EMatchmakerSource, IMatchmaker } from "@/schema/matchmaker.schema";
import { generateMatchmakingData } from "@/services/matchmaker.service";
export const OnboardingStep2Ghostwriter = () => {
  const {
    selectedNicheKeywords,
    selectedContentTypeKeywords,
    setStep,
    setUser,
  } = useGlobalStore();
  const { address } = useAccount();
  const { saveProfile, isSavingProfile } = useOnboarding();
  const router = useRouter();

  const [progressModalContent, setProgressModalContent] = useState<
    string | undefined
  >();

  const { nicheCheckboxes, contentTypeCheckboxes, nicheWarningVisible } =
    useCheckboxGroup();

  const form = useForm<IUser>({
    mode: "uncontrolled",
    initialValues: DefaultGhostwriterForm,
    validate: zodResolver(UserSchema),
  });

  useEffect(() => {
    form.setFieldValue("nicheKeywords", selectedNicheKeywords);
    form.setFieldValue("contentTypeKeywords", selectedContentTypeKeywords);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNicheKeywords, selectedContentTypeKeywords]);

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (values: IUser) => {
    try {
      const matchmakerPayload: IMatchmaker = {
        bio: values.about,
        samples: values.samples,
        nicheKeywords: values.nicheKeywords,
        contentTypeKeywords: values.contentTypeKeywords,
        budget: Number(values.ratePerWord),
        source: EMatchmakerSource.ONBOARDING,
      };

      setProgressModalContent("Generating matchmaking data...");
      const matchmakerResponse =
        await generateMatchmakingData(matchmakerPayload);

      if (!matchmakerResponse) {
        throw new Error("Failed to generate matchmaking data");
      }

      setProgressModalContent("Saving profile...");
      const response = await saveProfile({
        ...values,
        address: address!.toString(),
        matchmaker: matchmakerResponse,
      });

      if (response?.success && response.user) {
        setProgressModalContent("Profile successfully saved. Redirecting...");

        setUser(response.user);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error in gig package creation process:", error);
    } finally {
      setProgressModalContent(undefined);
    }
  };

  return (
    <Stack gap="xl" align="center" justify="center" h="100%">
      <Modal.Root
        opened={!!progressModalContent}
        onClose={() => {}}
        centered
        size="xl"
      >
        <Modal.Overlay className={classes.progressModalOverlay} />
        <Modal.Content className={classes.progressModalContent}>
          <Stack gap="md" align="center">
            <Loader size="lg" color="purple" />
            <Text size="sm" c="var(--mantine-color-midnight-9)">
              {progressModalContent}
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Please do not close or refresh the page.
            </Text>
          </Stack>
        </Modal.Content>
      </Modal.Root>

      <Stack gap="0" align="center">
        <Title order={1} fw={500}>
          Create your{" "}
          <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
            ghostwriting
          </Text>{" "}
          profile
        </Title>
        <Text size="xs" c="dimmed" w={560} ta="center">
          Helps our AI find creators that match your writing style and tone
        </Text>
      </Stack>
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: "600px" }}>
        <Stack gap="xl" w={"100%"}>
          <Input
            label="Preferred Name / Alias"
            placeholder="Satoshi Nakamoto"
            key={form.key("displayName")}
            {...form.getInputProps("displayName")}
          />
          <Textarea
            label="About Me"
            placeholder={
              "Blockchain bard who turns 'wen moon' into Shakespearean sonnets. I've ghostwritten so many whitepapers I'm practically a Web3 poltergeist!"
            }
            key={form.key("about")}
            {...form.getInputProps("about")}
          />

          {/* Sample writing style */}
          <Stack gap="md">
            <Stack gap="0">
              <InputLabel>Sample Writings</InputLabel>
              <Text size="xs" c="dimmed">
                Paste 3 previous writing samples to help us match you better
              </Text>
              <Text className={classes.errorText}>{form.errors.samples}</Text>
            </Stack>
            <Tabs
              variant="pills"
              radius="md"
              orientation="vertical"
              defaultValue="sample-1"
              color="purple.9"
            >
              <Tabs.List className={classes.tabsList}>
                <Tabs.Tab
                  value="sample-1"
                  leftSection={<IconNumber1 size={24} />}
                  className={classes.tab}
                ></Tabs.Tab>
                <Tabs.Tab
                  value="sample-2"
                  leftSection={<IconNumber2 size={24} />}
                  className={classes.tab}
                ></Tabs.Tab>
                <Tabs.Tab
                  value="sample-3"
                  leftSection={<IconNumber3 size={24} />}
                  className={classes.tab}
                ></Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="sample-1">
                <Textarea
                  placeholder="Blockchain isn't just a buzzword I throw around at parties to sound smart... okay, maybe sometimes. But when I write about it, even my cat seems interested. Or maybe that's just the cursor movement?"
                  h={240}
                  key={form.key("samples.0")}
                  {...form.getInputProps("samples.0")}
                />
              </Tabs.Panel>

              <Tabs.Panel value="sample-2">
                <Textarea
                  placeholder="Blockchain isn't just a buzzword I throw around at parties to sound smart... okay, maybe sometimes. But when I write about it, even my cat seems interested. Or maybe that's just the cursor movement?"
                  h={240}
                  key={form.key("samples.1")}
                  {...form.getInputProps("samples.1")}
                />
              </Tabs.Panel>

              <Tabs.Panel value="sample-3">
                <Textarea
                  placeholder="Blockchain isn't just a buzzword I throw around at parties to sound smart... okay, maybe sometimes. But when I write about it, even my cat seems interested. Or maybe that's just the cursor movement?"
                  h={240}
                  key={form.key("samples.2")}
                  {...form.getInputProps("samples.2")}
                />
              </Tabs.Panel>
            </Tabs>
          </Stack>

          <Stack gap="0">
            <Input
              label="Rate per word (USD)"
              placeholder="5"
              key={form.key("ratePerWord")}
              {...form.getInputProps("ratePerWord")}
            />
          </Stack>

          {/* Industries & Niches Keywords */}
          <Stack gap="sm">
            <Stack gap="0">
              <InputLabel>Industries & Niches</InputLabel>
              <Text size="xs" c="dimmed">
                Choose up to 10 industries and niches you&apos;re most skilled
                at
              </Text>
              <Text className={classes.errorText}>
                {form.errors.nicheKeywords}
              </Text>
              {nicheWarningVisible && (
                <Text size="xs" c="red.5">
                  You&apos;ve selected the maximum of 10 niche keywords
                </Text>
              )}
            </Stack>
            {nicheCheckboxes}
          </Stack>

          {/* Content Types */}
          <Stack gap="sm">
            <Stack gap="0">
              <InputLabel>Content Types</InputLabel>
              <Text size="xs" c="dimmed">
                Choose the content types you&apos;d like to write for
              </Text>
              <Text className={classes.errorText}>
                {form.errors.contentTypeKeywords}
              </Text>
            </Stack>
            {contentTypeCheckboxes}
          </Stack>
        </Stack>
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
            disabled={isSavingProfile}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="small"
            rightSection={<IconArrowRightDashed />}
            type="submit"
            loading={isSavingProfile}
            disabled={isSavingProfile || !!progressModalContent}
          >
            {isSavingProfile ? "Saving" : "Submit"}
          </Button>
        </Group>
      </form>
    </Stack>
  );
};
