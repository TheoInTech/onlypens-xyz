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
  Text,
  Tooltip,
} from "@mantine/core";
import React, { Usable, use } from "react";
import { AmountPill, GlassCard, StatusPill, ToneNichePill } from "@/components";
import useGig from "@/hooks/useGig";
import Image from "next/image";
import classes from "./page.module.css";
import { InviteGhostwriters } from "./invite-ghostwriters";

interface IGigIdPage {
  params: {
    gigId: string;
  };
}

const GigIdPage = ({ params }: IGigIdPage) => {
  const { gigId } = use(params as unknown as Usable<{ gigId: string }>);
  const { gigData, isLoadingGig } = useGig(gigId);

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

  return (
    <Stack gap="xl">
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
                  ) : metadata.deadline > Date.now() ? (
                    <>Ending in {getTimeUntil(metadata.deadline)}</>
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
      <InviteGhostwriters gig={gigData} />
    </Stack>
  );
};

export default GigIdPage;
