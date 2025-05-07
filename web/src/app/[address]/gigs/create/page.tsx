"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Text,
  Group,
  InputLabel,
  Box,
  Tabs,
  Flex,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { Input, Textarea, Checkbox, Button, NumberInput } from "@/components";
import {
  IconInfoCircle,
  IconNumber1,
  IconNumber2,
  IconNumber3,
  IconMinus,
  IconPlus,
} from "@tabler/icons-react";
import {
  EContentTypes,
  ENicheKeywords,
  EToneKeywords,
} from "@/schema/enum.schema";
import classes from "../../onboarding/step-2.module.css";

// Constants for max selections
const MAX_TONE_KEYWORDS = 5;
const MAX_NICHE_KEYWORDS = 3;

// Base prices for content types
const CONTENT_TYPE_PRICES: Record<string, number> = {
  [EContentTypes.SOCIAL_POST]: 50,
  [EContentTypes.SOCIAL_THREAD]: 120,
  [EContentTypes.SHORT_CAPTION]: 30,
  [EContentTypes.BLOG_NEWSLETTER]: 250,
  [EContentTypes.PRODUCT_MARKETING]: 150,
  [EContentTypes.WEBSITE_LANDING]: 175,
  [EContentTypes.SCRIPT_DIALOGUE]: 200,
  [EContentTypes.PERSONAL_BIO]: 100,
};

// Interface for content type with quantity
interface ContentTypeWithQuantity {
  type: string;
  quantity: number;
}

const PostGigPage = () => {
  const router = useRouter();

  // State for the form
  const [gigTitle, setGigTitle] = useState("");
  const [gigDescription, setGigDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [referenceWritings, setReferenceWritings] = useState(["", "", ""]);

  // Gig package state
  const [contentTypes, setContentTypes] = useState<ContentTypeWithQuantity[]>(
    []
  );
  const [toneKeywords, setToneKeywords] = useState<string[]>([]);
  const [nicheKeywords, setNicheKeywords] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  // Warning states
  const [toneWarningVisible, setToneWarningVisible] = useState(false);
  const [nicheWarningVisible, setNicheWarningVisible] = useState(false);

  // Warning timeout refs
  const toneWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nicheWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate AI suggested price
  const calculateAIPrice = () => {
    let basePrice = 0;
    contentTypes.forEach((item) => {
      basePrice += (CONTENT_TYPE_PRICES[item.type] || 75) * item.quantity;
    });

    const toneMultiplier = 1 + toneKeywords.length * 0.1;
    const nicheMultiplier = 1 + nicheKeywords.length * 0.05;

    const price = Math.round(basePrice * toneMultiplier * nicheMultiplier);
    setSuggestedPrice(price);
  };

  // Handle content type toggle
  const handleContentTypeToggle = (contentType: string, isChecked: boolean) => {
    if (isChecked) {
      setContentTypes((prev) => [...prev, { type: contentType, quantity: 1 }]);
    } else {
      setContentTypes((prev) =>
        prev.filter((item) => item.type !== contentType)
      );
    }
  };

  // Handle content type quantity change
  const handleQuantityChange = (contentType: string, quantity: number) => {
    setContentTypes((prev) =>
      prev.map((item) =>
        item.type === contentType ? { ...item, quantity } : item
      )
    );
  };

  // Check if a content type is selected
  const isContentTypeSelected = (contentType: string) => {
    return contentTypes.some((item) => item.type === contentType);
  };

  // Get quantity for a content type
  const getQuantity = (contentType: string) => {
    const item = contentTypes.find((item) => item.type === contentType);
    return item ? item.quantity : 1;
  };

  // Handle tone keyword toggle with max limit
  const handleToneKeywordToggle = (keyword: string, isChecked: boolean) => {
    if (isChecked && toneKeywords.length >= MAX_TONE_KEYWORDS) {
      // Show warning
      setToneWarningVisible(true);

      // Auto-hide after 3 seconds
      if (toneWarningTimeoutRef.current) {
        clearTimeout(toneWarningTimeoutRef.current);
      }

      toneWarningTimeoutRef.current = setTimeout(() => {
        setToneWarningVisible(false);
      }, 3000);

      return;
    }

    if (isChecked) {
      setToneKeywords((prev) => [...prev, keyword]);
    } else {
      setToneKeywords((prev) => prev.filter((k) => k !== keyword));
    }
  };

  // Handle niche keyword toggle with max limit
  const handleNicheKeywordToggle = (keyword: string, isChecked: boolean) => {
    if (isChecked && nicheKeywords.length >= MAX_NICHE_KEYWORDS) {
      // Show warning
      setNicheWarningVisible(true);

      // Auto-hide after 3 seconds
      if (nicheWarningTimeoutRef.current) {
        clearTimeout(nicheWarningTimeoutRef.current);
      }

      nicheWarningTimeoutRef.current = setTimeout(() => {
        setNicheWarningVisible(false);
      }, 3000);

      return;
    }

    if (isChecked) {
      setNicheKeywords((prev) => [...prev, keyword]);
    } else {
      setNicheKeywords((prev) => prev.filter((k) => k !== keyword));
    }
  };

  // Handle reference writing change
  const handleReferenceWritingChange = (index: number, value: string) => {
    const newWritings = [...referenceWritings];
    newWritings[index] = value;
    setReferenceWritings(newWritings);
  };

  // Handle price input change
  const handlePriceInputChange = (value: string) => {
    setSuggestedPrice(value ? parseInt(value) : null);
  };

  // Form validation
  const isFormComplete =
    gigTitle.trim() !== "" &&
    gigDescription.trim() !== "" &&
    deadline &&
    contentTypes.length > 0 &&
    suggestedPrice;

  // Handle post gig submission
  const handlePostGig = () => {
    const gigData = {
      title: gigTitle,
      description: gigDescription,
      deadline,
      referenceWritings,
      contentTypes,
      toneKeywords,
      nicheKeywords,
      price: suggestedPrice,
    };

    console.log("Posting gig:", gigData);

    // TODO: Send data to API
    // For now, just go back to dashboard
    router.push(`/dashboard`);
  };

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (toneWarningTimeoutRef.current) {
        clearTimeout(toneWarningTimeoutRef.current);
      }
      if (nicheWarningTimeoutRef.current) {
        clearTimeout(nicheWarningTimeoutRef.current);
      }
    };
  }, []);

  // Custom input style for consistency
  const inputStyles = {
    input: {
      backgroundColor: "var(--mantine-color-midnight-8)",
      color: "var(--mantine-color-white)",
      padding: "16px",
      borderRadius: "var(--mantine-radius-md)",
    },
  };

  const textareaStyles = {
    input: {
      backgroundColor: "var(--mantine-color-midnight-8)",
      color: "var(--mantine-color-white)",
      padding: "16px",
      minHeight: "160px",
      borderRadius: "var(--mantine-radius-md)",
    },
  };

  return (
    <Stack gap="xl" align="center" justify="center" py="xl">
      <Stack gap="0" align="center">
        <Title order={1} fw={500}>
          Post a new{" "}
          <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
            gig
          </Text>
        </Title>
        <Text size="xs" c="dimmed" w={560} ta="center">
          Our AI will match you with the perfect ghostwriter for your content
          needs
        </Text>
      </Stack>

      <form style={{ width: "600px" }}>
        <Stack gap="xl" w="100%">
          {/* Basic Gig Information */}
          <Stack gap="md">
            <div>
              <InputLabel>Gig Title</InputLabel>
              <Input
                placeholder="Write a series of crypto market analysis threads"
                onChange={(value) => setGigTitle(value)}
                styles={inputStyles}
              />
            </div>

            <div>
              <InputLabel>Gig Description</InputLabel>
              <Textarea
                placeholder="I need a skilled writer to create in-depth market analysis threads covering the latest trends in DeFi, NFTs, and layer-2 solutions..."
                onChange={(value) => setGigDescription(value)}
                styles={textareaStyles}
              />
            </div>

            <DatePickerInput
              label="Deadline"
              placeholder="Select deadline"
              value={deadline}
              onChange={setDeadline}
              minDate={new Date()}
            />
          </Stack>

          {/* Reference Writings */}
          <Stack gap="md">
            <Stack gap="0">
              <InputLabel>Reference Writings</InputLabel>
              <Text size="xs" c="dimmed">
                Paste 3 examples of writing styles you like to help match you
                better
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
                  placeholder="Example 1: Paste a sample of the writing style you like"
                  minRows={9}
                  onChange={(value) => handleReferenceWritingChange(0, value)}
                  styles={textareaStyles}
                />
              </Tabs.Panel>

              <Tabs.Panel value="sample-2">
                <Textarea
                  placeholder="Example 2: Paste a sample of the writing style you like"
                  minRows={9}
                  onChange={(value) => handleReferenceWritingChange(1, value)}
                  styles={textareaStyles}
                />
              </Tabs.Panel>

              <Tabs.Panel value="sample-3">
                <Textarea
                  placeholder="Example 3: Paste a sample of the writing style you like"
                  minRows={9}
                  onChange={(value) => handleReferenceWritingChange(2, value)}
                  styles={textareaStyles}
                />
              </Tabs.Panel>
            </Tabs>
          </Stack>

          {/* Gig Package */}
          <Stack gap="xl">
            <Stack gap="0">
              <InputLabel>Gig Package</InputLabel>
              <Text size="xs" c="dimmed">
                Configure your gig package with content types, tone, and niche
                preferences
              </Text>
            </Stack>

            <Stack gap="xl">
              {/* Content Types */}
              <Stack gap="xs">
                <InputLabel size="sm">Content Types</InputLabel>
                <Text size="xs" c="dimmed">
                  Select the type of content you want created and how many
                </Text>
                <Stack gap="md" mt="sm">
                  {Object.values(EContentTypes).map((contentType) => (
                    <Flex key={contentType} align="center" gap="md">
                      <Checkbox
                        label={contentType}
                        checked={isContentTypeSelected(contentType)}
                        onChange={(isChecked: boolean) =>
                          handleContentTypeToggle(contentType, isChecked)
                        }
                      />
                      {isContentTypeSelected(contentType) && (
                        <Group ml="auto">
                          <Text size="xs" c="dimmed" mr="xs">
                            Quantity:
                          </Text>
                          <NumberInput
                            min={1}
                            max={20}
                            value={getQuantity(contentType)}
                            onChange={(value) =>
                              handleQuantityChange(contentType, Number(value))
                            }
                            w={80}
                            radius="md"
                            decimalScale={0}
                            rightSection={<></>}
                            leftSection={
                              <IconMinus
                                size={16}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  const currentQty = getQuantity(contentType);
                                  if (currentQty > 1) {
                                    handleQuantityChange(
                                      contentType,
                                      currentQty - 1
                                    );
                                  }
                                }}
                              />
                            }
                            rightSectionWidth={28}
                            leftSectionWidth={28}
                            styles={{
                              input: {
                                textAlign: "center",
                                paddingLeft: 28,
                                paddingRight: 28,
                                backgroundColor:
                                  "var(--mantine-color-midnight-9)",
                              },
                              section: {
                                justifyContent: "center",
                              },
                            }}
                          />
                          <IconPlus
                            size={16}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const currentQty = getQuantity(contentType);
                              if (currentQty < 20) {
                                handleQuantityChange(
                                  contentType,
                                  currentQty + 1
                                );
                              }
                            }}
                          />
                        </Group>
                      )}
                    </Flex>
                  ))}
                </Stack>
              </Stack>

              {/* Tone Keywords */}
              <Stack gap="xs">
                <InputLabel size="sm">Tone Keywords</InputLabel>
                <Text size="xs" c="dimmed">
                  Choose up to {MAX_TONE_KEYWORDS} tone keywords
                </Text>
                <Group
                  style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}
                >
                  {Object.values(EToneKeywords).map((keyword) => (
                    <Checkbox
                      key={keyword}
                      label={keyword}
                      checked={toneKeywords.includes(keyword)}
                      onChange={(isChecked: boolean) =>
                        handleToneKeywordToggle(keyword, isChecked)
                      }
                    />
                  ))}
                </Group>
                {toneWarningVisible && (
                  <Text size="xs" c="red.5">
                    You&apos;ve selected the maximum of {MAX_TONE_KEYWORDS} tone
                    keywords
                  </Text>
                )}
              </Stack>

              {/* Niche Keywords */}
              <Stack gap="xs">
                <InputLabel size="sm">Niche Keywords</InputLabel>
                <Text size="xs" c="dimmed">
                  Choose up to {MAX_NICHE_KEYWORDS} niche keywords
                </Text>
                <Group
                  style={{ flexWrap: "wrap", gap: "8px", marginTop: "8px" }}
                >
                  {Object.values(ENicheKeywords).map((keyword) => (
                    <Checkbox
                      key={keyword}
                      label={keyword}
                      checked={nicheKeywords.includes(keyword)}
                      onChange={(isChecked: boolean) =>
                        handleNicheKeywordToggle(keyword, isChecked)
                      }
                    />
                  ))}
                </Group>
                {nicheWarningVisible && (
                  <Text size="xs" c="red.5">
                    You&apos;ve selected the maximum of {MAX_NICHE_KEYWORDS}{" "}
                    niche keywords
                  </Text>
                )}
              </Stack>

              {/* Pricing */}

              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stack gap={0}>
                  <InputLabel size="sm">Payment</InputLabel>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      Set the budget for this gig
                    </Text>
                    {suggestedPrice && (
                      <Text size="xs" c="green.6">
                        AI suggested: ${suggestedPrice}
                      </Text>
                    )}
                  </Group>
                </Stack>
                <Group gap="xs">
                  <Button
                    variant="outline"
                    onClick={calculateAIPrice}
                    disabled={contentTypes.length === 0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <IconInfoCircle size={16} />
                    <span>Get AI price</span>
                  </Button>

                  <div style={{ width: "100px" }}>
                    <Input
                      placeholder="$"
                      onChange={(value) => handlePriceInputChange(value)}
                      styles={inputStyles}
                    />
                  </div>
                </Group>
              </Box>
            </Stack>
          </Stack>

          {/* Submit Button */}
          <Box
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <Button onClick={handlePostGig} disabled={!isFormComplete}>
              Post Gig & Lock Budget
            </Button>
          </Box>
        </Stack>
      </form>
    </Stack>
  );
};

export default PostGigPage;
