import React from "react";
import classes from "./gig-card.module.css";
import { GlassCard } from "@/components/glass-card";
import { Box, Stack, Text, Tooltip } from "@mantine/core";
import Image from "next/image";
import { GigStatusLabels, IGig } from "@/schema/gig.schema";
import { getAmountFromDecimals, getContentTypeIcon } from "@/lib/utils";

export const GigCard = (gig: IGig) => {
  const { onchainGig, metadata } = gig;

  const icon = getContentTypeIcon(metadata.contentType);
  const amount = getAmountFromDecimals(onchainGig.amount, 6);

  return (
    <GlassCard className={classes.gigCard}>
      <Stack>
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
        <Tooltip
          label={metadata.title}
          classNames={{ tooltip: classes.titleTooltip }}
        >
          <Text size="xs" fw={700} truncate className={classes.titleText}>
            {metadata.title}
          </Text>
        </Tooltip>
        <Box className={classes.status}>
          {GigStatusLabels[onchainGig.status]}
        </Box>
        <Box className={classes.amount}>
          {amount}{" "}
          <Image
            src="/assets/icons/usdc.png"
            alt="USDC"
            width={16}
            height={16}
          />
        </Box>
      </Stack>
    </GlassCard>
  );
};
