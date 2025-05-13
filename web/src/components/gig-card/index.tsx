import React from "react";
import classes from "./gig-card.module.css";
import { GlassCard } from "@/components/glass-card";
import { Group, Stack, Text, Tooltip } from "@mantine/core";
import Image from "next/image";
import { IGig } from "@/schema/gig.schema";
import { getContentTypeIcon } from "@/lib/utils";
import cx from "clsx";
import { StatusPill } from "@/components/status-pill";
import { AmountPill } from "@/components/amount-pill";

interface IGigCard {
  gig: IGig;
  className?: string;
}

export const GigCard = ({ gig, className }: IGigCard) => {
  const { onchainGig, metadata } = gig;

  // Get unique content types from deliverables
  const contentTypes = [
    ...new Set(metadata.deliverables.map((d) => d.contentType)),
  ];

  return (
    <GlassCard className={cx(classes.gigCard, className)}>
      <Stack gap="0">
        <Stack className={classes.gigIconContainer}>
          <Group
            justify="space-between"
            wrap="nowrap"
            className={classes.contentTypeBanner}
          >
            <Text className={classes.contentTypeCount}>
              {contentTypes.length}{" "}
              {contentTypes.length === 1 ? "type" : "types"}
            </Text>
          </Group>

          <div className={classes.contentTypeBubbles}>
            {contentTypes.map((contentType, index) => (
              <Tooltip key={index} label={contentType}>
                <div
                  className={classes.bubbleWrapper}
                  style={{ zIndex: contentTypes.length - index }}
                >
                  <Image
                    src={`/assets/content-types/${getContentTypeIcon(contentType)}`}
                    alt={contentType}
                    width={48}
                    height={48}
                    className={classes.contentTypeBubble}
                  />
                </div>
              </Tooltip>
            ))}
          </div>
        </Stack>
        <Stack p="lg">
          <Tooltip
            label={metadata.title}
            classNames={{ tooltip: classes.titleTooltip }}
          >
            <Text size="xs" fw={700} truncate className={classes.titleText}>
              {metadata.title}
            </Text>
          </Tooltip>
          <StatusPill status={onchainGig.status} fullWidth />
          <AmountPill amount={onchainGig.amount} fullWidth />
        </Stack>
      </Stack>
    </GlassCard>
  );
};
