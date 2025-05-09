"use client";

import { Stack, Title, Text, Tabs, InputLabel, Group } from "@mantine/core";
import React, { useEffect } from "react";
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
import { useForm, zodResolver } from "@mantine/form";
import { DefaultCreatorForm, IUser, UserSchema } from "@/schema/user.schema";
import { useGlobalStore } from "@/stores";
import useOnboarding from "@/hooks/useOnboarding";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

export const OnboardingStep2Creator = () => {
  const { selectedToneKeywords, selectedNicheKeywords, setStep, setUser } =
    useGlobalStore();
  const { saveProfile, isSavingProfile } = useOnboarding();
  const router = useRouter();
  const { address } = useAccount();

  const {
    toneCheckboxes,
    nicheCheckboxes,
    toneWarningVisible,
    nicheWarningVisible,
  } = useCheckboxGroup();

  const form = useForm<IUser>({
    mode: "uncontrolled",
    initialValues: DefaultCreatorForm,
    validate: zodResolver(UserSchema),
  });

  useEffect(() => {
    form.setFieldValue("toneKeywords", selectedToneKeywords);
    form.setFieldValue("nicheKeywords", selectedNicheKeywords);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToneKeywords, selectedNicheKeywords]);

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (values: IUser) => {
    const response = await saveProfile({
      ...values,
      address: address!.toString(),
    });

    if (response?.success && response.user) {
      setUser(response.user);
      router.push("/dashboard");
    }
  };

  return (
    <Stack gap="xl" align="center" justify="center" h="100%">
      <Stack gap="0" align="center">
        <Title order={1} fw={500}>
          Create your{" "}
          <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
            creator
          </Text>{" "}
          profile
        </Title>
        <Text size="xs" c="dimmed" w={560} ta="center">
          Helps our AI find ghostwriters that match your writing style and tone
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
              "Creator who explains DeFi like I'm explaining to my grandma why her JPEGs are worth mortgage payments. Making crypto make sense since my last rugpull."
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

          {/* Tone Keywords */}
          <Stack gap="sm">
            <Stack gap="0">
              <InputLabel>Tone Keywords</InputLabel>
              <Text size="xs" c="dimmed">
                Choose up to 5 keywords that best describe your writing style
              </Text>
              <Text className={classes.errorText}>
                {form.errors.toneKeywords}
              </Text>
              {toneWarningVisible && (
                <Text size="xs" c="red.5">
                  You&apos;ve selected the maximum of 5 tone keywords
                </Text>
              )}
            </Stack>
            {toneCheckboxes}
          </Stack>

          {/* Industries & Niches Keywords */}
          <Stack gap="sm">
            <Stack gap="0">
              <InputLabel>Industries & Niches</InputLabel>
              <Text size="xs" c="dimmed">
                Choose up to 3 industries and niches you&apos;re in
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
            disabled={isSavingProfile}
          >
            {isSavingProfile ? "Saving" : "Submit"}
          </Button>
        </Group>
      </form>
    </Stack>
  );
};
