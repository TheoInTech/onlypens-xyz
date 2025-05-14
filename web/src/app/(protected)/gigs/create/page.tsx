"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Modal,
  Loader,
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
  IconCategory,
  IconCoin,
} from "@tabler/icons-react";
import { EContentTypes, ENicheKeywords } from "@/schema/enum.schema";
import { useGlobalStore } from "@/stores";
import { useForm, zodResolver } from "@mantine/form";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useWriteOnlyPensCreateGigPackage } from "@/hooks/abi-generated";
import { createGig, getRecentGig } from "@/services/gigs.service";
import classes from "./create.module.css";
import {
  GigFormSchema,
  IGigForm,
  MAX_NICHE_KEYWORDS,
} from "@/schema/gig.schema";
import getConfig from "@/lib/blockchain-config";
import { encodeFunctionData } from "viem";
import { USDCTestnetABI } from "@/lib/abi";
import { ITransactionError } from "@/schema/transaction.schema";
import { generateMatchmakingData } from "@/services/matchmaker.service";
import { EMatchmakerSource, IMatchmaker } from "@/schema/matchmaker.schema";

// Get blockchain config
const blockchainConfig = getConfig();

const CreatePackagePage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { selectedNicheKeywords, user } = useGlobalStore();
  const { writeContractAsync, isPending: isContractWritePending } =
    useWriteOnlyPensCreateGigPackage();

  // Local state for UI controls that aren't part of the IGigForm schema
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  const [useSavedReferences, setUseSavedReferences] = useState(false);
  const [useSavedNicheKeywords, setUseSavedNicheKeywords] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressModalContent, setProgressModalContent] = useState<
    string | undefined
  >();

  // Add state to track selected content types separately
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>(
    []
  );

  // Warning timeout refs
  const toneWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nicheWarningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for warnings
  const [nicheWarningVisible, setNicheWarningVisible] = React.useState(false);

  // Initialize form with IGigForm schema
  const form = useForm<IGigForm>({
    mode: "controlled",
    initialValues: {
      packageId: 0, // Will be set after contract transaction
      creatorAddress: address || "",
      transactionHash: "", // Will be set after contract transaction
      title: "",
      description: "",
      totalAmount: "0",
      expiresAt: null,
      nicheKeywords: [],
      deliverables: [],
      numberOfDeliverables: 0,
      referenceWritings: ["", "", ""],
      deadline: new Date(),
    },
    validate: zodResolver(GigFormSchema),
  });

  useEffect(() => {
    if (!useSavedNicheKeywords && selectedNicheKeywords.length > 0) {
      form.setFieldValue("nicheKeywords", selectedNicheKeywords);
    } else if (useSavedNicheKeywords) {
      form.setFieldValue("nicheKeywords", user?.nicheKeywords || []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSavedNicheKeywords, selectedNicheKeywords]);

  useEffect(() => {
    if (
      !useSavedReferences &&
      !!form.values.referenceWritings &&
      form.values.referenceWritings.length > 0
    ) {
      form.setFieldValue("referenceWritings", form.values.referenceWritings);
    } else if (useSavedReferences) {
      form.setFieldValue("referenceWritings", user?.samples || []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useSavedReferences, form.values.referenceWritings]);

  // Keep selectedContentTypes in sync with form.values.deliverables
  useEffect(() => {
    // Map deliverables to content type strings for UI state
    const contentTypes = form.values.deliverables.map((d) => d.contentType);
    setSelectedContentTypes(contentTypes);

    // Automatically calculate total amount when deliverables change
    if (contentTypes.length > 0) {
      calculateTotalAmount();
    }
  }, [form.values.deliverables]);

  // Calculate AI suggested price
  const calculateAIPrice = () => {
    // TODO: Ask LLM about price insights based on content requirements, writing samples, tones, niche and deadline.
    // Important to research the market price for the content type and niche and add it as context of the prompt.

    if (form.values.deliverables.length === 0) {
      setSuggestedPrice(null);
      return;
    }

    // setSuggestedPrice(calculatedPrice);
  };

  const handleReferenceWritingChange = (index: number, value: string) => {
    const newReferenceWritings = [...(form.values.referenceWritings || [])];
    newReferenceWritings[index] = value;
    form.setFieldValue("referenceWritings", newReferenceWritings);
  };

  // Handle content type toggle
  const handleContentTypeToggle = (contentType: string, checked: boolean) => {
    let newDeliverables = [...form.values.deliverables];

    // Convert string contentType to enum value to ensure type safety
    // This assumes contentType is one of the values in EContentTypes
    const contentTypeEnum = Object.values(EContentTypes).find(
      (type) => type === contentType
    ) as EContentTypes;

    if (!contentTypeEnum) {
      console.error("Invalid content type:", contentType);
      return;
    }

    // Update separate state for UI
    if (checked) {
      setSelectedContentTypes((prev) => [...prev, contentType]);
    } else {
      setSelectedContentTypes((prev) =>
        prev.filter((type) => type !== contentType)
      );
    }

    // Find what's being added or removed
    const existingItem = newDeliverables.find(
      (item) => item.contentType === contentTypeEnum
    );
    let priceChange = 0;

    if (checked) {
      // Check if already exists to avoid duplicates
      if (!existingItem) {
        newDeliverables.push({
          contentType: contentTypeEnum,
          price: String(0),
          quantity: String(1),
        });
      }
    } else {
      // Calculate price being removed
      if (existingItem) {
        priceChange = -parseFloat(existingItem.price);
      }

      // Remove from deliverables
      newDeliverables = newDeliverables.filter(
        (d) => d.contentType !== contentTypeEnum
      );
    }

    // Update the form
    form.setFieldValue("deliverables", newDeliverables);
    form.setFieldValue("numberOfDeliverables", newDeliverables.length);

    // Update the total amount directly by adding or subtracting the price change
    const currentTotal = parseFloat(form.values.totalAmount) || 0;
    const newTotal = Math.max(0, currentTotal + priceChange); // Ensure never negative

    // Update all form values at once
    form.setValues({
      ...form.values,
      deliverables: newDeliverables,
      numberOfDeliverables: newDeliverables.length,
      totalAmount: newTotal.toFixed(2),
    });
  };

  // Handle deliverable quantity change
  const handleQuantityChange = (contentType: string, quantity: number) => {
    // Convert string contentType to enum value
    const contentTypeEnum = Object.values(EContentTypes).find(
      (type) => type === contentType
    ) as EContentTypes;

    if (!contentTypeEnum) {
      console.error("Invalid content type:", contentType);
      return;
    }

    // Get the current item
    const currentItem = form.values.deliverables.find(
      (item) => item.contentType === contentTypeEnum
    );

    if (currentItem) {
      const deliverables = form.values.deliverables.map((item) =>
        item.contentType === contentTypeEnum
          ? {
              ...item,
              quantity: String(quantity),
            }
          : item
      );

      form.setFieldValue("deliverables", deliverables);
    }
  };

  // Handle deliverable price change
  const handlePriceChange = (contentType: string, price: number) => {
    // Convert string contentType to enum value
    const contentTypeEnum = Object.values(EContentTypes).find(
      (type) => type === contentType
    ) as EContentTypes;

    if (!contentTypeEnum) {
      console.error("Invalid content type:", contentType);
      return;
    }

    const deliverables = form.values.deliverables.map((item) =>
      item.contentType === contentTypeEnum
        ? { ...item, price: price.toFixed(2) }
        : item
    );

    form.setFieldValue("deliverables", deliverables);
    calculateTotalAmount();
  };

  // Calculate total amount from all deliverables' custom prices
  const calculateTotalAmount = () => {
    let total = 0;

    // Make sure we're using the latest deliverables from the form
    const currentDeliverables = form.values.deliverables;
    console.log("Calculating total from deliverables:", currentDeliverables);

    currentDeliverables.forEach((deliverable) => {
      const price = parseFloat(deliverable.price);
      if (!isNaN(price)) {
        total += price;
      }
    });

    console.log("New total amount:", total);
    form.setFieldValue("totalAmount", total.toFixed(2));
  };

  // Check if a content type is selected
  const isContentTypeSelected = (contentType: string) => {
    // Use local state for UI rendering
    return selectedContentTypes.includes(contentType);
  };

  // Get quantity for a deliverable
  const getDeliverableQuantity = (contentType: string) => {
    // Convert string contentType to enum value
    const contentTypeEnum = Object.values(EContentTypes).find(
      (type) => type === contentType
    ) as EContentTypes;

    if (!contentTypeEnum) {
      console.error("Invalid content type:", contentType);
      return 1; // Default quantity
    }

    const item = form.values.deliverables.find(
      (item) => item.contentType === contentTypeEnum
    );

    return item ? parseInt(item.quantity, 10) : 1; // Default quantity
  };

  // Get price for a deliverable
  const getDeliverablePrice = (contentType: string) => {
    // Convert string contentType to enum value
    const contentTypeEnum = Object.values(EContentTypes).find(
      (type) => type === contentType
    ) as EContentTypes;

    if (!contentTypeEnum) {
      console.error("Invalid content type:", contentType);
      return 0; // Default price
    }

    const item = form.values.deliverables.find(
      (item) => item.contentType === contentTypeEnum
    );

    // If price exists in the item, use it, otherwise use the base price
    return item ? parseFloat(item.price) : 0;
  };

  // Handle niche keyword toggle with max limit
  const handleNicheKeywordToggle = (keyword: string, checked: boolean) => {
    const currentKeywords = [...form.values.nicheKeywords];

    if (checked && currentKeywords.length >= MAX_NICHE_KEYWORDS) {
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

    if (checked) {
      form.setFieldValue("nicheKeywords", [
        ...currentKeywords,
        keyword as ENicheKeywords,
      ]);
    } else {
      form.setFieldValue(
        "nicheKeywords",
        currentKeywords.filter((k) => k !== keyword)
      );
    }
  };

  // Handle post gig submission
  const handleSubmit = async (values: IGigForm) => {
    try {
      if (!address || !walletClient) {
        throw new Error("Wallet not connected");
      }

      setIsSubmitting(true);

      setProgressModalContent("Creating your gig...");

      // TODO: Move this to useGig hook
      const totalAmount = BigInt(
        Math.round(parseFloat(values.totalAmount) * 10 ** 6)
      );

      // Approve the contract to spend the USDC
      // Generate the approve function data
      const approveData = encodeFunctionData({
        abi: USDCTestnetABI,
        functionName: "approve",
        args: [blockchainConfig.onlyPensAddress, totalAmount],
      });

      setProgressModalContent("Approving USDC allowance...");

      // Send the transaction
      const hash = await walletClient.sendTransaction({
        to: blockchainConfig.usdcAddress,
        data: approveData,
        account: address,
      });
      console.log("Approval transaction submitted with hash:", hash);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Token approval verified - continuing submission", receipt);

      // Format deliverables for contract - sending our custom price as the amount
      const formattedDeliverables = values.deliverables.map((d) => ({
        contentType: d.contentType,
        amount: BigInt(Math.round(parseFloat(d.price) * 10 ** 6)), // Using our custom price as amount for contract
        quantity: BigInt(d.quantity),
      }));

      // Convert expiration date to timestamp if set
      const expirationTimestamp =
        hasExpiration && expirationDate
          ? Math.floor(expirationDate.getTime() / 1000)
          : 0;

      values.expiresAt = expirationTimestamp || null;

      setProgressModalContent("Creating gig package on chain...");
      // Send transaction to blockchain
      try {
        const tx = await writeContractAsync({
          args: [
            BigInt(Math.round(parseFloat(values.totalAmount) * 10 ** 6)),
            formattedDeliverables,
            BigInt(expirationTimestamp),
          ],
        });

        // Wait for transaction to be mined
        console.log("Transaction submitted successfully:", tx);
        values.transactionHash = tx;

        // Wait for blockchain indexing (can be adjusted based on network speed)
        console.log("Waiting for transaction confirmation...");
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Fetch the latest gig created to get the packageId
        setProgressModalContent("Fetching recent indexed gig data onchain...");
        console.log("Fetching recent gig data from blockchain...");
        const recentGig = await getRecentGig();

        if (!recentGig) {
          throw new Error(
            "Failed to retrieve the newly created gig from the blockchain"
          );
        }

        console.log("Recent gig data retrieved:", recentGig);

        values.packageId = Number(recentGig.packageId);
        values.creatorAddress = address;

        const matchmakerPayload: IMatchmaker = {
          bio: values.description,
          samples: values.referenceWritings,
          nicheKeywords: values.nicheKeywords,
          contentTypeKeywords: values.deliverables.map((d) => d.contentType),
          budget: Number(values.totalAmount),
          source: EMatchmakerSource.GIG_CREATION,
        };

        setProgressModalContent("Generating matchmaking data...");
        console.log("Generating matchmaking data:", matchmakerPayload);
        const matchmakerResponse =
          await generateMatchmakingData(matchmakerPayload);

        if (!matchmakerResponse) {
          throw new Error("Failed to generate matchmaking data");
        }

        const createGigPayload: IGigForm = {
          ...values,
          matchmaker: matchmakerResponse,
        };
        // Save metadata to Firestore using our createGig service
        console.log("Saving metadata to database...", createGigPayload);
        setProgressModalContent("Saving metadata...");
        const result = await createGig(createGigPayload);

        console.log("Gig created successfully:", result);

        setProgressModalContent(
          "Gig created successfully! Redirecting to gig detail page..."
        );
        // Redirect to dashboard or gig detail page
        router.push(`/gigs/${result.onchainGig.gigId}`);
      } catch (error: unknown) {
        console.error("Transaction execution error:", error);
        // Type safety when handling the error
        const txError = error as ITransactionError;
        if (
          txError?.message &&
          typeof txError.message === "string" &&
          txError.message.includes("User denied")
        ) {
          console.log("User rejected the transaction in wallet");
        }
      }
    } catch (error) {
      console.error("Error in gig package creation process:", error);
    } finally {
      setIsSubmitting(false);
      setProgressModalContent(undefined);
    }
  };

  // Check if the form is complete (for submit button)
  const isFormComplete =
    form.values.deliverables.length > 0 &&
    form.values.title.length >= 3 &&
    form.values.description.length >= 10 &&
    form.isValid();

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

      <Stack gap="0" align="center" mb="md">
        <Title order={1} fw={500}>
          Create a new{" "}
          <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
            gig package
          </Text>
        </Title>
        <Text size="xs" c="dimmed" w={560} ta="center">
          Our AI will match you with the perfect ghostwriter for your content
          needs
        </Text>
      </Stack>

      <form
        style={{ width: "700px", maxWidth: "100%" }}
        onSubmit={form.onSubmit(handleSubmit)}
      >
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
                  key={form.key("title")}
                  {...form.getInputProps("title")}
                />
                {form.errors.title && (
                  <Text size="xs" c="red" mt="xs">
                    {form.errors.title}
                  </Text>
                )}
              </div>

              <div>
                <InputLabel fw={500} mb="xs">
                  Package Description
                </InputLabel>
                <Textarea
                  placeholder="I need a skilled writer to create in-depth market analysis threads covering the latest trends in DeFi, NFTs, and layer-2 solutions..."
                  key={form.key("description")}
                  {...form.getInputProps("description")}
                />
                {form.errors.description && (
                  <Text size="xs" c="red" mt="xs">
                    {form.errors.description}
                  </Text>
                )}
              </div>

              <div>
                <InputLabel fw={500} mb="xs">
                  Deadline
                </InputLabel>
                <DatePickerInput
                  placeholder="Select deadline"
                  key={form.key("deadline")}
                  {...form.getInputProps("deadline")}
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
                    onChange={(checked) => setHasExpiration(checked)}
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
                    onChange={(value) => setExpirationDate(value)}
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
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
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
                    value={form.values.referenceWritings?.[0]}
                    onChange={(value) => handleReferenceWritingChange(0, value)}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="sample-2">
                  <Textarea
                    placeholder="Example 2: Paste a sample of the writing style you like"
                    minRows={9}
                    value={form.values.referenceWritings?.[1]}
                    onChange={(value) => handleReferenceWritingChange(1, value)}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="sample-3">
                  <Textarea
                    placeholder="Example 3: Paste a sample of the writing style you like"
                    minRows={9}
                    value={form.values.referenceWritings?.[2]}
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
                        onChange={(checked) =>
                          handleContentTypeToggle(contentType, checked)
                        }
                      />
                      {isContentTypeSelected(contentType) && (
                        <Group ml="auto">
                          <Group>
                            <Text size="xs" c="dimmed" mr="xs">
                              Quantity:
                            </Text>
                            <Group gap={"xs"}>
                              <IconMinus
                                size={16}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  const currentQuantity =
                                    getDeliverableQuantity(contentType);
                                  if (currentQuantity > 1) {
                                    handleQuantityChange(
                                      contentType,
                                      currentQuantity - 1
                                    );
                                  }
                                }}
                              />
                              <NumberInput
                                min={1}
                                max={100}
                                value={getDeliverableQuantity(contentType)}
                                onChange={(value) =>
                                  handleQuantityChange(
                                    contentType,
                                    Number(value)
                                  )
                                }
                                w={80}
                                radius="md"
                                decimalScale={0}
                                prefix=""
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
                                  const currentQuantity =
                                    getDeliverableQuantity(contentType);
                                  if (currentQuantity < 100) {
                                    handleQuantityChange(
                                      contentType,
                                      currentQuantity + 1
                                    );
                                  }
                                }}
                              />
                            </Group>
                          </Group>
                          <Group align="center" gap="xs">
                            <Text size="xs" c="dimmed" mr="xs">
                              Price ($):
                            </Text>
                            <NumberInput
                              min={1}
                              max={10000}
                              value={getDeliverablePrice(contentType)}
                              onChange={(value) =>
                                handlePriceChange(contentType, Number(value))
                              }
                              w={100}
                              radius="md"
                              decimalScale={2}
                              step={0.01}
                              prefix=""
                              rightSection={<></>}
                              styles={{
                                input: {
                                  textAlign: "center",
                                  backgroundColor:
                                    "var(--mantine-color-midnight-9)",
                                },
                              }}
                            />
                          </Group>
                        </Group>
                      )}
                    </Flex>
                  ))}
                </Stack>

                {form.errors.deliverables && (
                  <Text size="xs" c="red" mt="xs">
                    {form.errors.deliverables}
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
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
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
                          checked={form.values.nicheKeywords.includes(keyword)}
                          onChange={(checked) =>
                            handleNicheKeywordToggle(keyword, checked)
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
                    {form.errors.nicheKeywords && (
                      <Text size="xs" c="red" mt="xs">
                        {form.errors.nicheKeywords}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text className={classes.savedPrefsText}>
                    Using your saved niche keywords from your profile (
                    {user?.nicheKeywords.join(", ")})
                  </Text>
                )}
              </Stack>

              <Divider my="sm" />

              {/* Price Summary */}
              <Stack gap="md">
                <Group gap="md">
                  <IconCoin size={18} />
                  <InputLabel size="sm" fw={500}>
                    Package Price
                  </InputLabel>
                </Group>

                <Group>
                  <Text size="sm">
                    Total price:{" "}
                    <Text component="span" fw={600}>
                      ${form.values.totalAmount}
                    </Text>
                  </Text>
                </Group>

                {form.values.deliverables.length > 0 && (
                  <Stack gap="xs" mt="xs">
                    <Text size="xs" fw={500}>
                      Price breakdown:
                    </Text>
                    {form.values.deliverables.map((deliverable, index) => {
                      const price = parseFloat(deliverable.price);
                      const quantity = parseInt(deliverable.quantity, 10) || 1;

                      return (
                        <Group key={index} justify="space-between" gap="xs">
                          <Text size="xs" c="dimmed">
                            {quantity} x {deliverable.contentType}
                          </Text>
                          <Text size="xs">${price.toFixed(2)}</Text>
                        </Group>
                      );
                    })}
                  </Stack>
                )}

                <Button
                  variant="outline"
                  onClick={calculateAIPrice}
                  disabled={form.values.deliverables.length === 0}
                  size="small"
                  leftSection={<IconInfoCircle size={16} />}
                  type="button"
                  mt="sm"
                >
                  Get AI Price Insight
                </Button>

                {!!suggestedPrice && (
                  <Box className={classes.aiInsightBox} mt="sm">
                    <Group gap="md" mb="xs">
                      <IconInfoCircle
                        size={18}
                        color="var(--mantine-color-blue-6)"
                      />
                      <Text size="sm" fw={500} c="blue.6">
                        AI Price Insight
                      </Text>
                    </Group>

                    {!!suggestedPrice && (
                      <>
                        <Text size="sm" mb="xs">
                          AI suggested price:{" "}
                          <Text component="span" fw={600}>
                            ${suggestedPrice}
                          </Text>
                        </Text>

                        {parseFloat(form.values.totalAmount) <
                          suggestedPrice * 0.8 && (
                          <Text size="xs" c="yellow.6" mb="xs">
                            Your price might be too low compared to the market
                            price based on your content requirements, writing
                            samples, tones, niche and deadline.
                          </Text>
                        )}
                      </>
                    )}
                  </Box>
                )}
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
              type="submit"
              disabled={
                !isFormComplete || isContractWritePending || isSubmitting
              }
              size="default"
              loading={isContractWritePending || isSubmitting}
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
