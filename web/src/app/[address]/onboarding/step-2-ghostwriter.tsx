"use client";

import { Stack, Title, Text, Tabs, InputLabel } from "@mantine/core";
import React from "react";
import { Input, Textarea } from "@/components";
import { IconNumber1, IconNumber2, IconNumber3 } from "@tabler/icons-react";
import classes from "./step-2.module.css";
import { useCheckboxGroup } from "@/hooks/useCheckboxGroup";

export const OnboardingStep2Ghostwriter = () => {
  const {
    toneCheckboxes,
    nicheCheckboxes,
    toneWarningVisible,
    nicheWarningVisible,
    contentTypeCheckboxes,
  } = useCheckboxGroup();

  return (
    <Stack gap="xl" align="center" justify="center" h="100%">
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
      <form style={{ width: "600px" }}>
        <Stack gap="xl" w={"100%"}>
          <Input
            label="Preferred Name / Alias"
            placeholder="Satoshi Nakamoto"
          />
          <Textarea
            label="About Me"
            placeholder={
              "Blockchain bard who turns 'wen moon' into Shakespearean sonnets. I've ghostwritten so many whitepapers I'm practically a Web3 poltergeist!"
            }
          />

          {/* Sample writing style */}
          <Stack gap="md">
            <Stack gap="0">
              <InputLabel>Sample Writings</InputLabel>
              <Text size="xs" c="dimmed">
                Paste 3 previous writing samples to help us match you better
              </Text>
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
                />
              </Tabs.Panel>

              <Tabs.Panel value="sample-2">
                <Textarea
                  placeholder="Blockchain isn't just a buzzword I throw around at parties to sound smart... okay, maybe sometimes. But when I write about it, even my cat seems interested. Or maybe that's just the cursor movement?"
                  h={240}
                />
              </Tabs.Panel>

              <Tabs.Panel value="sample-3">
                <Textarea
                  placeholder="Blockchain isn't just a buzzword I throw around at parties to sound smart... okay, maybe sometimes. But when I write about it, even my cat seems interested. Or maybe that's just the cursor movement?"
                  h={240}
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
            </Stack>
            {toneCheckboxes}
            {toneWarningVisible && (
              <Text size="xs" c="red.5">
                You&apos;ve selected the maximum of 5 tone keywords
              </Text>
            )}
          </Stack>

          {/* Industries & Niches Keywords */}
          <Stack gap="sm">
            <Stack gap="0">
              <InputLabel>Industries & Niches</InputLabel>
              <Text size="xs" c="dimmed">
                Choose up to 10 industries and niches you&apos;re most skilled
                at
              </Text>
            </Stack>
            {nicheCheckboxes}
            {nicheWarningVisible && (
              <Text size="xs" c="red.5">
                You&apos;ve selected the maximum of 10 niche keywords
              </Text>
            )}
          </Stack>

          {/* Content Types */}
          <Stack gap="sm">
            <Stack gap="0">
              <InputLabel>Content Types</InputLabel>
              <Text size="xs" c="dimmed">
                Choose the content types you&apos;d like to write for
              </Text>
            </Stack>
            {contentTypeCheckboxes}
          </Stack>
        </Stack>
      </form>
    </Stack>
  );
};
