import classes from "./dashboard.module.css";
import { Grid, GridCol, Group, Stack, Text } from "@mantine/core";
import {
  Button,
  GlassCard,
  GlassCardTitle,
  GradientBanner,
  Table,
} from "@/components";
import React from "react";
import { mockActivityLogs } from "@/schema/activity-log.schema";
import { timestampAgo } from "@/lib/utils";
import Link from "next/link";

const fetchActivityLogs = async () => {
  const response = mockActivityLogs.map((log) => ({
    ...log,
    createdAt: timestampAgo(log.createdAt),
  }));

  return response;
};

interface IDashboardPage {
  params: {
    address: string;
  };
}

const DashboardPage = async ({ params }: IDashboardPage) => {
  const { address } = await params;
  const activityLogs = await fetchActivityLogs();

  return (
    <Stack gap="md" w="100%">
      <GradientBanner variant="blue-purple">
        <Group justify="space-between" align="center">
          <div>
            <Text size="md" fw={700} c="white">
              Need something written?
            </Text>
            <Text c="white" opacity={0.9} size="xs">
              Post your next gig and let AI match you with the perfect
              ghostwriter.
            </Text>
          </div>
          <Button
            variant="white"
            size="small"
            component={Link}
            href={`/${address}/gigs/create`}
          >
            Post a Gig
          </Button>
        </Group>
      </GradientBanner>
      <Group justify="space-between" align="center" gap="md" wrap="nowrap">
        <GlassCard className={classes.card}>
          <GlassCardTitle>Total Gigs</GlassCardTitle>
          <Text className={classes.valueWrapper}>
            <span className={classes.amount}>{(50).toLocaleString()}</span>
            <span className={classes.currency}>Gigs</span>
          </Text>
        </GlassCard>
        <GlassCard className={classes.card}>
          <GlassCardTitle>Total Spent</GlassCardTitle>
          <Text className={classes.valueWrapper}>
            <span className={classes.amount}>${(10000).toLocaleString()}</span>
            <span className={classes.currency}>USD</span>
          </Text>
        </GlassCard>
        <GlassCard className={classes.card}>
          <GlassCardTitle>Total Escrowed</GlassCardTitle>
          <Text className={classes.valueWrapper}>
            <span className={classes.amount}>${(10000).toLocaleString()}</span>
            <span className={classes.currency}>USD</span>
          </Text>
        </GlassCard>
      </Group>
      <Grid>
        <GridCol span={12}>
          <GlassCard>
            <GlassCardTitle>Recent Gig Updates</GlassCardTitle>
            <Table
              columns={[
                { key: "title", label: "Title" },
                { key: "activity", label: "Gig" },
                { key: "createdAt", label: "When?" },
              ]}
              data={activityLogs}
            />
          </GlassCard>
        </GridCol>
        <GridCol span={6}>
          <GlassCard>
            <GlassCardTitle>Drafts Waiting for Approval</GlassCardTitle>
          </GlassCard>
        </GridCol>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
