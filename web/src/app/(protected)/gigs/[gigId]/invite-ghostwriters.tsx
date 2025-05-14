"use client";

import { Button, GlassCard } from "@/components";
import React from "react";
import classes from "./invite-ghostwriters.module.css";
import { Stack, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { IGig } from "@/schema/gig.schema";

// TODO:
// 1. Empty state - "You haven't matched with ghostwriters yet" -> Button to match ghostwriters
// 2. "Match more ghostwriters" button to add more to the list of ghostwriters
// 3. Ghostwriters list
// 4. Invite ghostwriters button per row
// 5. See ghostwriter profile button per row -> opens modal with ghostwriter profile
// 6. Invite more ghostwriters button once exceeds 3 invites

interface IInviteGhostwriters {
  gig: IGig;
}

export const InviteGhostwriters = ({ gig }: IInviteGhostwriters) => {
  const handleMatchGhostwriters = () => {
    // TODO:
    // 1. Call API with matchmaking logic
    // 2. Save response into the gig object under ghostwriters field
  };

  return (
    <Stack gap="sm">
      <Text size="md" fw={500}>
        Ghostwriters for this gig
      </Text>

      {/* Empty state */}
      <GlassCard className={classes.fullWidthGlassCard}>
        <Text className={classes.valueWrapper}>
          You haven&apos;t matched with ghostwriters yet
        </Text>
        <Button
          variant="white"
          size="small"
          leftSection={<IconSparkles />}
          onClick={handleMatchGhostwriters}
        >
          Match ghostwriters
        </Button>
      </GlassCard>
    </Stack>
  );
};
