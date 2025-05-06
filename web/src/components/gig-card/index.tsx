import React from "react";
import classes from "./gig-card.module.css";
import { GlassCard } from "@/components/glass-card";
import { Stack, Text, Tooltip } from "@mantine/core";
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
  const icon = getContentTypeIcon(metadata.contentType);

  return (
    <GlassCard className={cx(classes.gigCard, className)}>
      <Stack gap="0">
        <Stack className={classes.gigIconContainer}>
          <Text className={classes.contentTypeText}>
            {metadata.contentType}
          </Text>
          <Image
            src={`/assets/content-types/${icon}`}
            alt="Gig Icon"
            width={1024}
            height={1024}
            className={classes.gigIcon}
          />
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
