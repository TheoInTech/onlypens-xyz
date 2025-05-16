"use client";

import { getContentTypeIcon, getTimeUntil } from "@/lib/utils";
import {
  Container,
  Divider,
  Grid,
  GridCol,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import React, { Usable, use } from "react";
import {
  AmountPill,
  Button,
  GlassCard,
  StatusPill,
  Textarea,
  ToneNichePill,
} from "@/components";
import useGig from "@/hooks/useGig";
import Image from "next/image";
import classes from "./page.module.css";
import { InviteGhostwriters } from "./invite-ghostwriters";
import { ERoles } from "@/stores/constants";
import { useGlobalStore } from "@/stores";
import { IconNumber1, IconNumber2, IconNumber3 } from "@tabler/icons-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GigIdPage = ({ params }: any) => {
  const { gigId } = use(params as unknown as Usable<{ gigId: string }>);
  const { gigData, isLoadingGig, refetchGig } = useGig(gigId);
  const { role } = useGlobalStore();

  if (isLoadingGig) {
    return (
      <Container
        p="sm"
        h="100%"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Loader color="purple" />
        <Text>Loading your gig...</Text>
      </Container>
    );
  }

  if (!gigData) {
    return (
      <Container
        p="sm"
        h="100%"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <Text>Gig not found. Please try again.</Text>
      </Container>
    );
  }

  const { metadata, onchainGig } = gigData;

  // Get unique content types from deliverables
  const contentTypes = [
    ...new Set(metadata.deliverables.map((d) => d.contentType)),
  ];

  const handleAcceptInvitation = () => {
    console.log("Accepting invitation");
    // TODO: Add another confirmation prompt
    // For MVP, just proceed
  };

  const handleDeclineInvitation = () => {
    console.log("Declining invitation");
    // TODO: Add another confirmation prompt
    // For MVP, just proceed
  };

  return (
    <Stack gap="xl">
      {role === ERoles.GHOSTWRITER && (
        <Stack gap="xs" w="100%" justify="center" align="center">
          <Text size="xs">You are invited to this gig!</Text>
          <Group gap="xs">
            <Button
              variant="outline"
              size="small"
              onClick={handleDeclineInvitation}
            >
              Decline
            </Button>
            <Button
              variant="white"
              size="small"
              onClick={handleAcceptInvitation}
            >
              Accept
            </Button>
          </Group>
        </Stack>
      )}
      <GlassCard>
        <Grid gutter="xl">
          <GridCol span={4}>
            <div className={classes.contentTypeDisplay}>
              <div className={classes.contentTypeHeader}>
                <Text className={classes.contentTypeCount}>
                  {contentTypes.length}{" "}
                  {contentTypes.length === 1 ? "Content Type" : "Content Types"}
                </Text>
              </div>
              <div className={classes.contentTypeBubbles}>
                {contentTypes.map((contentType, index) => (
                  <Tooltip key={index} label={contentType} position="bottom">
                    <div
                      className={classes.bubbleWrapper}
                      style={{
                        zIndex: contentTypes.length - index,
                        transform: `translateX(${index * -8}px)`,
                      }}
                    >
                      <Image
                        src={`/assets/content-types/${getContentTypeIcon(contentType)}`}
                        alt={contentType}
                        width={64}
                        height={64}
                        className={classes.contentTypeBubble}
                      />
                    </div>
                  </Tooltip>
                ))}
              </div>
              <div className={classes.deliverableSummary}>
                {metadata.deliverables.map((deliverable, index) => (
                  <div key={index} className={classes.deliverableItem}>
                    <Text size="xs" fw={700}>
                      {deliverable.contentType}
                    </Text>
                    <Text size="xs">Qty: {deliverable.quantity}</Text>
                  </div>
                ))}
              </div>
            </div>
          </GridCol>
          <GridCol span={8}>
            <Stack>
              <Text size="md" fw={700} truncate>
                {metadata.title}
              </Text>
              <Group gap="md">
                <Text size="sm" c="gray.2">
                  {metadata.deadline === null ||
                  metadata.deadline === undefined ? (
                    <>Deadline not set</>
                  ) : new Date(metadata.deadline).getTime() > Date.now() ? (
                    <>
                      Ending in{" "}
                      {getTimeUntil(new Date(metadata.deadline).getTime())}
                    </>
                  ) : (
                    <>Gig has ended</>
                  )}
                </Text>
                <Divider orientation="vertical" />
                <StatusPill status={onchainGig.status} size="md" />
                <AmountPill amount={onchainGig.amount} size="md" />
              </Group>
              <Text size="sm" c="gray.2">
                {metadata.description}
              </Text>
              <Group gap="xs">
                <Text size="xs" fw={700}>
                  Niches:{" "}
                </Text>
                <Group gap="xs">
                  {metadata.nicheKeywords.map((niche) => (
                    <ToneNichePill value={niche} size="md" key={niche} />
                  ))}
                </Group>
              </Group>
            </Stack>
          </GridCol>
        </Grid>
      </GlassCard>
      {/* Sample writing style */}
      <Stack gap="xs">
        <Text size="md" fw={500}>
          Creator&apos;s sample writing
        </Text>
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
              h={240}
              value={gigData.metadata?.referenceWritings?.[0]}
              disabled
            />
          </Tabs.Panel>

          <Tabs.Panel value="sample-2">
            <Textarea
              h={240}
              value={gigData.metadata?.referenceWritings?.[1]}
              disabled
            />
          </Tabs.Panel>

          <Tabs.Panel value="sample-3">
            <Textarea
              h={240}
              value={gigData.metadata?.referenceWritings?.[2]}
              disabled
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>
      {role === ERoles.CREATOR && (
        <InviteGhostwriters gig={gigData} refetchGig={refetchGig} />
      )}
    </Stack>
  );
};

export default GigIdPage;
