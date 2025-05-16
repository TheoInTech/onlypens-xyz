import React from "react";
import {
  Title,
  Text,
  Stack,
  Group,
  Grid,
  GridCol,
  Avatar,
} from "@mantine/core";
import { RoleSwitch } from "./role-switch";
import { Button, GlassCard, GlassCardTitle } from "@/components";
import {
  IconArrowNarrowRightDashed,
  IconFileUpload,
  IconRobot,
  IconHandClick,
  IconCash,
} from "@tabler/icons-react";
import classes from "./onboarding.module.css";
import { useGlobalStore } from "@/stores";
import Image from "next/image";
import cx from "clsx";
import { shortenAddress } from "@/lib/utils";
import { ERoles } from "@/stores/constants";

const mockRealtimeEarners = [
  {
    address: "0xA996b471e6D161c776ac88b82cB55F3BC490a356",
    amount: 9500,
    initials: "OP",
  },
  {
    address: "0x0096b471e6D161c776ac88b82cB55F3BC490a356",
    amount: 2500,
    initials: "ST",
  },
  {
    address: "0x1234b471e6D161c776ac88b82cB55F3BC490a123",
    amount: 7800,
    initials: "JD",
  },
  {
    address: "0x5678b471e6D161c776ac88b82cB55F3BC490a567",
    amount: 4200,
    initials: "MK",
  },
  {
    address: "0x9012b471e6D161c776ac88b82cB55F3BC490a901",
    amount: 6300,
    initials: "RW",
  },
  {
    address: "0x3456b471e6D161c776ac88b82cB55F3BC490a345",
    amount: 3700,
    initials: "AL",
  },
  {
    address: "0x7890b471e6D161c776ac88b82cB55F3BC490a789",
    amount: 5100,
    initials: "PQ",
  },
];

export const OnboardingStep1 = () => {
  const { setStep, role } = useGlobalStore();

  const handleProceed = () => {
    setStep(2);
  };

  return (
    <Stack gap="xl" align="center" justify="center" h="100%">
      <Title order={1} fw={500}>
        How would you like to use{" "}
        <Text component="span" fs="italic" fw={900} style={{ fontSize: 32 }}>
          OnlyPens
        </Text>
        ?
      </Title>
      <Group gap="xl">
        <RoleSwitch />
        <Button
          variant="secondary"
          size="small"
          rightSection={<IconArrowNarrowRightDashed />}
          onClick={handleProceed}
        >
          Proceed
        </Button>
      </Group>
      <Stack className={classes.tilesContainer}>
        <Stack gap="xl">
          <Grid gutter="xl">
            <GridCol span={5}>
              <Stack gap="xl">
                <GlassCard className={classes.card}>
                  <GlassCardTitle>Total Earnings</GlassCardTitle>
                  <Text className={classes.valueWrapper}>
                    <span className={classes.amount}>$69,123,456</span>
                    <span className={classes.currency}>USD</span>
                  </Text>
                </GlassCard>
                <GlassCard className={classes.card}>
                  <GlassCardTitle>Realtime Earnings</GlassCardTitle>
                  <Stack gap="md">
                    {mockRealtimeEarners.map((earner) => (
                      <Group gap="md" key={earner.address}>
                        <Avatar color="cyan" radius="xl">
                          {earner.initials}
                        </Avatar>
                        <Text className={classes.realtimeWallet}>
                          {shortenAddress(earner.address)}{" "}
                        </Text>
                        <Text className={classes.realtimeWallet}>
                          just earned
                        </Text>
                        <Text className={classes.realtimeAmount}>
                          ${earner.amount}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </GlassCard>
              </Stack>
            </GridCol>
            <GridCol span={7}>
              <Stack gap="xl">
                <GlassCard className={classes.card}>
                  <GlassCardTitle>A Simple Process</GlassCardTitle>
                  <div className={classes.processContainer}>
                    <div className={classes.processStep}>
                      <div className={classes.processCircle}>
                        <IconFileUpload size={48} style={{ opacity: 0.9 }} />
                      </div>
                      <Text className={classes.processText}>Submit sample</Text>
                      <div className={classes.processArrow} />
                    </div>
                    <div className={classes.processStep}>
                      <div className={classes.processCircle}>
                        <IconRobot size={48} style={{ opacity: 0.9 }} />
                      </div>
                      <Text className={classes.processText}>
                        AI analyzes sample
                      </Text>
                      <div className={classes.processArrow} />
                    </div>
                    <div className={classes.processStep}>
                      <div className={classes.processCircle}>
                        <IconHandClick size={48} style={{ opacity: 0.9 }} />
                      </div>
                      <Text className={classes.processText}>
                        Match & Submit work
                      </Text>
                      <div className={classes.processArrow} />
                    </div>
                    <div className={classes.processStep}>
                      <div className={classes.processCircle}>
                        <IconCash size={48} style={{ opacity: 0.9 }} />
                      </div>
                      <Text className={classes.processText}>
                        Receive payment
                      </Text>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className={cx(classes.card, classes.gigCard)}>
                  <Image
                    src="/assets/gig-sample.png"
                    alt="Gig Sample"
                    fill
                    className={classes.gigImage}
                  />
                </GlassCard>
              </Stack>
            </GridCol>
          </Grid>
          <GlassCard className={cx(classes.card, classes.fullWidthGlassCard)}>
            <Text className={classes.valueWrapper}>
              {role === ERoles.CREATOR
                ? "Over 6,900 ghostwriters are waiting to be matched."
                : "Over 14,000 gigs are looking for ghostwriters."}
            </Text>
          </GlassCard>
        </Stack>
      </Stack>
    </Stack>
  );
};
