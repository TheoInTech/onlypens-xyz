"use client";

import { useGlobalStore } from "@/stores";
import { ERoles } from "@/stores/constants";
import { Stack, Title, Text, Tabs, InputLabel, Group } from "@mantine/core";
import React, { useState, useRef, useCallback, useMemo } from "react";
import { Input, Textarea, Checkbox } from "@/components";
import { IconNumber1, IconNumber2, IconNumber3 } from "@tabler/icons-react";
import classes from "./step-2.module.css";
import {
  EContentTypes,
  ENicheKeywords,
  EToneKeywords,
} from "@/schema/enum.schema";

export const OnboardingStep2 = () => {
  const {
    role,
    selectedToneKeywords,
    setSelectedToneKeywords,
    selectedNicheKeywords,
    setSelectedNicheKeywords,
    selectedContentTypeKeywords,
    setSelectedContentTypeKeywords,
  } = useGlobalStore();

  const [localToneKeywords, setLocalToneKeywords] =
    useState<string[]>(selectedToneKeywords);
  const [localNicheKeywords, setLocalNicheKeywords] = useState<string[]>(
    selectedNicheKeywords
  );
  const [localContentTypeKeywords, setLocalContentTypeKeywords] = useState<
    string[]
  >(selectedContentTypeKeywords);

  const [toneWarningVisible, setToneWarningVisible] = useState(false);
  const [nicheWarningVisible, setNicheWarningVisible] = useState(false);
  const [contentTypeWarningVisible, setContentTypeWarningVisible] =
    useState(false);

  const toneWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nicheWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentTypeWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generic keyword toggle handler with useCallback
  const handleKeywordToggle = useCallback(
    <T extends string>(
      keyword: string,
      isChecked: boolean,
      localKeywords: string[],
      setLocalKeywords: (keywords: string[]) => void,
      globalSetKeywords: (keywords: T[]) => void,
      maxAllowed: number,
      warningVisible: boolean,
      setWarningVisible: (visible: boolean) => void,
      warningTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
    ) => {
      let newKeywords: string[];

      if (isChecked) {
        // Don't add if we already have reached max allowed
        if (maxAllowed > 0 && localKeywords.length >= maxAllowed) {
          // Show the warning and auto-hide after 3 seconds
          setWarningVisible(true);

          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
          }

          warningTimeoutRef.current = setTimeout(() => {
            setWarningVisible(false);
          }, 3000);

          return;
        }
        newKeywords = [...localKeywords, keyword];
      } else {
        newKeywords = localKeywords.filter((k) => k !== keyword);
        // Hide warning if showing
        if (warningVisible) {
          setWarningVisible(false);
          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
            warningTimeoutRef.current = null;
          }
        }
      }

      setLocalKeywords(newKeywords);
      globalSetKeywords(newKeywords as T[]);
    },
    []
  );

  // Memoized specialized handlers for each keyword type
  const handleToneKeywordToggle = useCallback(
    (keyword: string, isChecked: boolean) => {
      handleKeywordToggle<EToneKeywords>(
        keyword,
        isChecked,
        localToneKeywords,
        setLocalToneKeywords,
        setSelectedToneKeywords,
        5, // Max allowed tone keywords
        toneWarningVisible,
        setToneWarningVisible,
        toneWarningTimeoutRef
      );
    },
    [
      handleKeywordToggle,
      localToneKeywords,
      toneWarningVisible,
      setSelectedToneKeywords,
    ]
  );

  const handleNicheKeywordToggle = useCallback(
    (keyword: string, isChecked: boolean) => {
      handleKeywordToggle<ENicheKeywords>(
        keyword,
        isChecked,
        localNicheKeywords,
        setLocalNicheKeywords,
        setSelectedNicheKeywords,
        role === ERoles.GHOSTWRITER ? 10 : 3, // Max allowed niche keywords
        nicheWarningVisible,
        setNicheWarningVisible,
        nicheWarningTimeoutRef
      );
    },
    [
      role,
      handleKeywordToggle,
      localNicheKeywords,
      nicheWarningVisible,
      setSelectedNicheKeywords,
    ]
  );

  const handleContentTypeToggle = useCallback(
    (keyword: string, isChecked: boolean) => {
      handleKeywordToggle<EContentTypes>(
        keyword,
        isChecked,
        localContentTypeKeywords,
        setLocalContentTypeKeywords,
        setSelectedContentTypeKeywords,
        -1, // Max allowed niche keywords
        contentTypeWarningVisible,
        setContentTypeWarningVisible,
        nicheWarningTimeoutRef
      );
    },
    [
      handleKeywordToggle,
      localContentTypeKeywords,
      contentTypeWarningVisible,
      setSelectedContentTypeKeywords,
    ]
  );

  // Memoize the checkbox groups to prevent unnecessary re-renders
  const toneCheckboxes = useMemo(
    () => (
      <Group style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
        {Object.values(EToneKeywords).map((keyword) => (
          <Checkbox
            key={keyword}
            label={keyword}
            checked={localToneKeywords.includes(keyword)}
            onChange={(isChecked: boolean) =>
              handleToneKeywordToggle(keyword, isChecked)
            }
          />
        ))}
      </Group>
    ),
    [localToneKeywords, handleToneKeywordToggle]
  );

  const nicheCheckboxes = useMemo(
    () => (
      <Group style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
        {Object.values(ENicheKeywords).map((keyword) => (
          <Checkbox
            key={keyword}
            label={keyword}
            checked={localNicheKeywords.includes(keyword)}
            onChange={(isChecked: boolean) =>
              handleNicheKeywordToggle(keyword, isChecked)
            }
          />
        ))}
      </Group>
    ),
    [localNicheKeywords, handleNicheKeywordToggle]
  );

  const contentTypeCheckboxes = useMemo(
    () => (
      <Group style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
        {Object.values(EContentTypes).map((keyword) => (
          <Checkbox
            key={keyword}
            label={keyword}
            checked={localContentTypeKeywords.includes(keyword)}
            onChange={(isChecked: boolean) =>
              handleContentTypeToggle(keyword, isChecked)
            }
          />
        ))}
      </Group>
    ),
    [localContentTypeKeywords, handleContentTypeToggle]
  );

  // Clear timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (toneWarningTimeoutRef.current) {
        clearTimeout(toneWarningTimeoutRef.current);
      }
      if (nicheWarningTimeoutRef.current) {
        clearTimeout(nicheWarningTimeoutRef.current);
      }
      if (contentTypeWarningTimeoutRef.current) {
        clearTimeout(contentTypeWarningTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Stack gap="xl" align="center" justify="center" h="100%">
      <Stack gap="0" align="center">
        <Title order={1} fw={500}>
          Create your{" "}
          <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
            {role === ERoles.GHOSTWRITER ? "ghostwriting" : "creator"}
          </Text>{" "}
          profile
        </Title>
        <Text size="xs" c="dimmed" w={560} ta="center">
          Helps our AI find {role}s that match your writing style and tone
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
              role === ERoles.GHOSTWRITER
                ? "Blockchain bard who turns 'wen moon' into Shakespearean sonnets. I've ghostwritten so many whitepapers I'm practically a Web3 poltergeist!"
                : "Creator who explains DeFi like I'm explaining to my grandma why her JPEGs are worth mortgage payments. Making crypto make sense since my last rugpull."
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
                Choose up to {role === ERoles.GHOSTWRITER ? "10" : "3"}{" "}
                industries and niches you&apos;re{" "}
                {role === ERoles.GHOSTWRITER ? "most skilled at" : "in"}
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
          {role === ERoles.GHOSTWRITER && (
            <Stack gap="sm">
              <Stack gap="0">
                <InputLabel>Content Types</InputLabel>
                <Text size="xs" c="dimmed">
                  Choose the content types you&apos;d like to write for
                </Text>
              </Stack>
              {contentTypeCheckboxes}
              {toneWarningVisible && (
                <Text size="xs" c="red.5">
                  You&apos;ve selected the maximum of 5 tone keywords
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </form>
    </Stack>
  );
};
