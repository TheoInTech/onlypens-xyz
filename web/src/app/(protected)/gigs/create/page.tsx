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
  Switch,
  Divider,
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
  IconPackage,
  IconPencil,
  IconCalendar,
  IconFileText,
  IconMoodHappy,
  IconCategory,
  IconCoin,
} from "@tabler/icons-react";
import {
  EActivityType,
  EContentTypes,
  ENicheKeywords,
  EToneKeywords,
} from "@/schema/enum.schema";
import { useGlobalStore } from "@/stores";
import classes from "./create.module.css";

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

// Interface for content type with quantity (deliverable)
interface DeliverableInput {
  contentType: string;
  amount: number; // Price in USDC (smallest units)
}

const CreatePackagePage = () => {
  const router = useRouter();

  // Get saved preferences from global store
  const { selectedToneKeywords, selectedNicheKeywords } = useGlobalStore();

  // State for using saved preferences
  const [useSavedReferences, setUseSavedReferences] = useState(false);
  const [useSavedToneKeywords, setUseSavedToneKeywords] = useState(false);
  const [useSavedNicheKeywords, setUseSavedNicheKeywords] = useState(false);

  // State for the form
  const [gigTitle, setGigTitle] = useState("");
  const [gigDescription, setGigDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [referenceWritings, setReferenceWritings] = useState(["", "", ""]);

  // Gig package state
  const [deliverables, setDeliverables] = useState<DeliverableInput[]>([]);
  const [toneKeywords, setToneKeywords] = useState<string[]>([]);
  const [nicheKeywords, setNicheKeywords] = useState<string[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [gigPrice, setGigPrice] = useState<number | null>(null);

  // New state for package expiration (optional)
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  // Warning states
  const [toneWarningVisible, setToneWarningVisible] = useState(false);
  const [nicheWarningVisible, setNicheWarningVisible] = useState(false);

  // Warning timeout refs
  const toneWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nicheWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply saved preferences when toggles change
  useEffect(() => {
    if (useSavedToneKeywords && selectedToneKeywords.length > 0) {
      setToneKeywords(selectedToneKeywords);
    } else if (!useSavedToneKeywords) {
      setToneKeywords([]);
    }
  }, [useSavedToneKeywords, selectedToneKeywords]);

  useEffect(() => {
    if (useSavedNicheKeywords && selectedNicheKeywords.length > 0) {
      setNicheKeywords(selectedNicheKeywords);
    } else if (!useSavedNicheKeywords) {
      setNicheKeywords([]);
    }
  }, [useSavedNicheKeywords, selectedNicheKeywords]);

  // Calculate AI suggested price
  // TODO: Make this AI-powered
  const calculateAIPrice = () => {
    let basePrice = 0;
    deliverables.forEach((deliverable) => {
      basePrice += CONTENT_TYPE_PRICES[deliverable.contentType] || 75;
    });

    const toneMultiplier = 1 + toneKeywords.length * 0.1;
    const nicheMultiplier = 1 + nicheKeywords.length * 0.05;

    const price = Math.round(basePrice * toneMultiplier * nicheMultiplier);
    setSuggestedPrice(price);
  };

  // Handle content type toggle
  const handleContentTypeToggle = (contentType: string, isChecked: boolean) => {
    if (isChecked) {
      setDeliverables((prev) => [
        ...prev,
        {
          contentType,
          amount: CONTENT_TYPE_PRICES[contentType] || 75,
        },
      ]);
    } else {
      setDeliverables((prev) =>
        prev.filter((item) => item.contentType !== contentType)
      );
    }
  };

  // Handle deliverable amount change
  const handleAmountChange = (contentType: string, amount: number) => {
    setDeliverables((prev) =>
      prev.map((item) =>
        item.contentType === contentType ? { ...item, amount } : item
      )
    );
  };

  // Check if a content type is selected
  const isContentTypeSelected = (contentType: string) => {
    return deliverables.some((item) => item.contentType === contentType);
  };

  // Get amount for a deliverable
  const getDeliverableAmount = (contentType: string) => {
    const item = deliverables.find((item) => item.contentType === contentType);
    return item ? item.amount : CONTENT_TYPE_PRICES[contentType] || 75;
  };

  // Calculate total package amount
  const calculateTotalAmount = () => {
    return deliverables.reduce((sum, item) => sum + item.amount, 0);
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
    setGigPrice(value ? parseInt(value) : null);
  };

  // Form validation
  const isFormComplete =
    gigTitle.trim() !== "" &&
    gigDescription.trim() !== "" &&
    deadline &&
    deliverables.length > 0 &&
    (gigPrice || calculateTotalAmount() > 0);

  // Convert $ to USDC smallest units (6 decimals)
  const usdToUsdcUnits = (usdAmount: number) => {
    return usdAmount * 1_000_000;
  };

  // Handle post gig submission
  const handlePostGig = () => {
    // Prepare deliverables for smart contract format
    const deliverableInputs = deliverables.map((item) => ({
      contentType: item.contentType,
      amount: usdToUsdcUnits(item.amount), // Convert to USDC units
    }));

    // Calculate total amount
    const totalAmount = usdToUsdcUnits(gigPrice || calculateTotalAmount());

    // Prepare expiry timestamp if enabled
    const expiresAt =
      hasExpiration && expirationDate
        ? Math.floor(expirationDate.getTime() / 1000)
        : 0;

    const gigPackageData = {
      // Smart contract data for createGigPackage function
      contractData: {
        totalAmount,
        deliverables: deliverableInputs,
        expiresAt,
      },

      // Metadata to save in Firestore
      metadata: {
        title: gigTitle,
        description: gigDescription,
        contentType: deliverables[0].contentType, // Primary content type
        toneKeywords: useSavedToneKeywords
          ? selectedToneKeywords
          : toneKeywords,
        nicheKeywords: useSavedNicheKeywords
          ? selectedNicheKeywords
          : nicheKeywords,
        wordCount: null, // Can be set later
        deadline: deadline ? Math.floor(deadline.getTime() / 1000) : null,
        invitedGhostwriters: [],
        referenceWritings: useSavedReferences
          ? ["Using saved references"]
          : referenceWritings,
      },

      // Activity log entry
      event: EActivityType.GIG_CREATED,
    };

    console.log("Creating gig package:", gigPackageData);

    // TODO: Integrate with smart contract
    // 1. Save metadata to Firestore
    // 2. Call smart contract's createGigPackage function

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

  return (
    <Stack gap="xl" align="center" justify="center" py="xl">
      <Stack gap="0" align="center" mb="md">
        <Title order={1} fw={500}>
          Create new{" "}
          <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
            package
          </Text>
        </Title>
        <Text size="xs" c="dimmed" w={560} ta="center">
          Our AI will match you with the perfect ghostwriter for your content
          needs
        </Text>
      </Stack>

      <form style={{ width: "700px", maxWidth: "100%" }}>
        <Stack gap="xl" w="100%">
          {/* Basic Gig Information */}
          <Box className={classes.formSection}>
            <Group className={classes.formSectionTitle} justify="space-between">
              <Group gap="md">
                <IconPencil size={20} />
                <Title order={4}>Basic Information</Title>
              </Group>
            </Group>

            <Stack gap="lg">
              <div>
                <InputLabel fw={500} mb="xs">
                  Package Title
                </InputLabel>
                <Input
                  placeholder="Write a series of crypto market analysis threads"
                  onChange={(value) => setGigTitle(value)}
                />
              </div>

              <div>
                <InputLabel fw={500} mb="xs">
                  Package Description
                </InputLabel>
                <Textarea
                  placeholder="I need a skilled writer to create in-depth market analysis threads covering the latest trends in DeFi, NFTs, and layer-2 solutions..."
                  onChange={(value) => setGigDescription(value)}
                />
              </div>

              <div>
                <InputLabel fw={500} mb="xs">
                  Deadline
                </InputLabel>
                <DatePickerInput
                  placeholder="Select deadline"
                  value={deadline}
                  onChange={setDeadline}
                  minDate={new Date()}
                  leftSection={<IconCalendar size={16} />}
                  styles={{
                    day: {
                      height: "24px",
                      width: "24px",
                      fontSize: "12px",
                    },
                    weekday: {
                      fontSize: "11px",
                      padding: "4px",
                    },
                    monthCell: {
                      padding: "2px",
                    },
                    month: {
                      fontSize: "12px",
                    },
                    calendarHeader: {
                      padding: "4px",
                      marginBottom: "4px",
                    },
                    calendarHeaderControl: {
                      height: "24px",
                      width: "24px",
                    },
                    calendarHeaderLevel: {
                      fontSize: "12px",
                      padding: "4px",
                    },
                  }}
                  popoverProps={{
                    styles: {
                      dropdown: {
                        width: "220px",
                        padding: "4px",
                      },
                    },
                  }}
                />
              </div>

              <div>
                <Group align="center">
                  <Checkbox
                    label="Set package expiration (optional)"
                    checked={hasExpiration}
                    onChange={(isChecked: boolean) =>
                      setHasExpiration(isChecked)
                    }
                  />
                  <Text size="xs" c="dimmed">
                    Package will auto-cancel if no ghostwriter accepts by this
                    date
                  </Text>
                </Group>

                {hasExpiration && (
                  <DatePickerInput
                    placeholder="Select expiration date"
                    value={expirationDate}
                    onChange={setExpirationDate}
                    minDate={new Date()}
                    leftSection={<IconCalendar size={16} />}
                    mt="sm"
                    styles={{
                      day: {
                        height: "24px",
                        width: "24px",
                        fontSize: "12px",
                      },
                      weekday: {
                        fontSize: "11px",
                        padding: "4px",
                      },
                    }}
                  />
                )}
              </div>
            </Stack>
          </Box>

          {/* Reference Writings */}
          <Box className={classes.formSection}>
            <Group className={classes.formSectionTitle} justify="space-between">
              <Group gap="md">
                <IconFileText size={20} />
                <Title order={4}>Reference Writings</Title>
              </Group>
              <Group className={classes.switchGroup}>
                <Text size="xs">Use saved references</Text>
                <Switch
                  checked={useSavedReferences}
                  onChange={(event) =>
                    setUseSavedReferences(event.currentTarget.checked)
                  }
                />
              </Group>
            </Group>

            <Text size="xs" c="dimmed" mb="md">
              Paste examples of writing styles you like to help match you better
            </Text>

            {!useSavedReferences ? (
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
                  />
                </Tabs.Panel>

                <Tabs.Panel value="sample-2">
                  <Textarea
                    placeholder="Example 2: Paste a sample of the writing style you like"
                    minRows={9}
                    onChange={(value) => handleReferenceWritingChange(1, value)}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="sample-3">
                  <Textarea
                    placeholder="Example 3: Paste a sample of the writing style you like"
                    minRows={9}
                    onChange={(value) => handleReferenceWritingChange(2, value)}
                  />
                </Tabs.Panel>
              </Tabs>
            ) : (
              <Text className={classes.savedPrefsText}>
                Using your saved reference writings from your profile
              </Text>
            )}
          </Box>

          {/* Deliverables */}
          <Box className={classes.formSection}>
            <Group className={classes.formSectionTitle} justify="space-between">
              <Group gap="md">
                <IconPackage size={20} />
                <Title order={4}>Deliverables</Title>
              </Group>
            </Group>

            <Text size="xs" c="dimmed" mb="lg">
              Configure your deliverables with content types, pricing, and
              preferences
            </Text>

            <Stack gap="xl">
              {/* Content Types */}
              <Stack gap="md">
                <Group gap="md">
                  <IconCategory size={18} />
                  <InputLabel size="sm" fw={500}>
                    Content Types
                  </InputLabel>
                </Group>
                <Text size="xs" c="dimmed">
                  Select the type of content you want created and specify the
                  price for each
                </Text>
                <Stack gap="xs" mt="xs">
                  {Object.values(EContentTypes).map((contentType) => (
                    <Flex
                      key={contentType}
                      align="center"
                      gap="md"
                      className={classes.contentTypeItem}
                    >
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
                            Price (USD):
                          </Text>
                          <Group gap={"xs"}>
                            <IconMinus
                              size={16}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                const currentAmount =
                                  getDeliverableAmount(contentType);
                                if (currentAmount > 10) {
                                  handleAmountChange(
                                    contentType,
                                    currentAmount - 5
                                  );
                                }
                              }}
                            />
                            <NumberInput
                              min={10}
                              max={1000}
                              value={getDeliverableAmount(contentType)}
                              onChange={(value) =>
                                handleAmountChange(contentType, Number(value))
                              }
                              w={80}
                              radius="md"
                              decimalScale={0}
                              prefix="$"
                              rightSection={<></>}
                              styles={{
                                input: {
                                  textAlign: "center",
                                  backgroundColor:
                                    "var(--mantine-color-midnight-9)",
                                },
                              }}
                            />
                            <IconPlus
                              size={16}
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                const currentAmount =
                                  getDeliverableAmount(contentType);
                                if (currentAmount < 1000) {
                                  handleAmountChange(
                                    contentType,
                                    currentAmount + 5
                                  );
                                }
                              }}
                            />
                          </Group>
                        </Group>
                      )}
                    </Flex>
                  ))}
                </Stack>

                {deliverables.length > 0 && (
                  <Group justify="flex-end" mt="md">
                    <Text size="sm" fw={500}>
                      Total Package Amount: ${calculateTotalAmount()}
                    </Text>
                  </Group>
                )}
              </Stack>

              <Divider my="sm" />

              {/* Tone Keywords */}
              <Stack gap="md">
                <Group
                  className={classes.formSectionTitle}
                  justify="space-between"
                >
                  <Group gap="md">
                    <IconMoodHappy size={18} />
                    <InputLabel size="sm" fw={500}>
                      Tone Keywords
                    </InputLabel>
                  </Group>
                  <Group className={classes.switchGroup}>
                    <Text size="xs">Use saved tone</Text>
                    <Switch
                      checked={useSavedToneKeywords}
                      onChange={(event) =>
                        setUseSavedToneKeywords(event.currentTarget.checked)
                      }
                    />
                  </Group>
                </Group>

                {!useSavedToneKeywords ? (
                  <>
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
                        You&apos;ve selected the maximum of {MAX_TONE_KEYWORDS}{" "}
                        tone keywords
                      </Text>
                    )}
                  </>
                ) : (
                  <Text className={classes.savedPrefsText}>
                    Using your saved tone keywords from your profile (
                    {selectedToneKeywords.length} selected)
                  </Text>
                )}
              </Stack>

              <Divider my="sm" />

              {/* Niche Keywords */}
              <Stack gap="md">
                <Group
                  className={classes.formSectionTitle}
                  justify="space-between"
                >
                  <Group gap="md">
                    <IconCategory size={18} />
                    <InputLabel size="sm" fw={500}>
                      Niche Keywords
                    </InputLabel>
                  </Group>
                  <Group className={classes.switchGroup}>
                    <Text size="xs">Use saved niches</Text>
                    <Switch
                      checked={useSavedNicheKeywords}
                      onChange={(event) =>
                        setUseSavedNicheKeywords(event.currentTarget.checked)
                      }
                    />
                  </Group>
                </Group>

                {!useSavedNicheKeywords ? (
                  <>
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
                  </>
                ) : (
                  <Text className={classes.savedPrefsText}>
                    Using your saved niche keywords from your profile (
                    {selectedNicheKeywords.length} selected)
                  </Text>
                )}
              </Stack>

              <Divider my="sm" />

              {/* Custom Price (Optional) */}
              <Stack gap="md">
                <Group gap="md">
                  <IconCoin size={18} />
                  <InputLabel size="sm" fw={500}>
                    Custom Package Price (Optional)
                  </InputLabel>
                </Group>

                <Group justify="space-between">
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      Override the total price (optional)
                    </Text>
                    {suggestedPrice && (
                      <Text size="xs" c="green.6">
                        AI suggested: ${suggestedPrice}
                      </Text>
                    )}
                  </Group>
                  <Group gap="xs">
                    <Button
                      variant="outline"
                      onClick={calculateAIPrice}
                      disabled={deliverables.length === 0}
                      size="small"
                      leftSection={<IconInfoCircle size={16} />}
                    >
                      Get AI price
                    </Button>

                    <div style={{ width: "100px" }}>
                      <Input
                        placeholder="$"
                        onChange={handlePriceInputChange}
                      />
                    </div>
                  </Group>
                </Group>
              </Stack>
            </Stack>
          </Box>

          {/* Submit Button */}
          <Box
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <Button
              onClick={handlePostGig}
              disabled={!isFormComplete}
              size="default"
            >
              Create Package & Lock Funds
            </Button>
          </Box>
        </Stack>
      </form>
    </Stack>
  );
};

export default CreatePackagePage;
