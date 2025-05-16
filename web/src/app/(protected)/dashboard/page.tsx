"use client";

import classes from "./dashboard.module.css";
import {
  Grid,
  GridCol,
  Group,
  Stack,
  Text,
  Alert,
  Badge,
  Box,
  Container,
  Loader,
} from "@mantine/core";
import {
  Button,
  GlassCard,
  GlassCardTitle,
  GradientBanner,
  Table,
} from "@/components";
import Link from "next/link";
import { ERoles } from "@/stores/constants";
import { IActivityLog } from "@/schema/activity-log.schema";
import { formatDistanceToNow } from "date-fns";
import { EActivityType } from "@/schema/enum.schema";
import useDashboard from "@/hooks/useDashboard";

// Interface for formatted activity log table data
interface IFormattedActivityLog extends IActivityLog {
  createdAt: string; // Formatted date string for display
  activity: EActivityType;
  title: string;
  id: string;
  [key: string]: string | number | EActivityType; // More specific index signature
}

const DashboardPage = () => {
  // Fetch dashboard data from our API
  const { dashboardData: response, isLoadingDashboard } = useDashboard();

  // Handle API errors
  if (isLoadingDashboard) {
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
        <Text>Fetching your dashboard data...</Text>
      </Container>
    );
  }

  if (!!response?.error || !response?.data) {
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
        <Text>
          {response?.error ||
            "There was an issue fetching the dashboard data. Please try again later."}
        </Text>
      </Container>
    );
  }

  const dashboardData = response.data;

  // Format activity logs for display
  const formattedActivityLogs: IFormattedActivityLog[] =
    dashboardData.recentActivity.map((log) => ({
      ...log,
      createdAt: formatDistanceToNow(new Date(log.createdAt), {
        addSuffix: true,
      }),
    }));

  // ======== Render Creator Dashboard ========
  if (dashboardData.role === ERoles.CREATOR) {
    // Format data for display
    const totalGigsCreated = dashboardData.totalGigsCreated;
    const totalAmountSpent = (
      parseInt(dashboardData.totalAmountSpent) / 1_000_000
    ).toFixed(2); // Convert from smallest units
    const totalEscrowedAmount = (
      parseInt(dashboardData.totalEscrowedAmount) / 1_000_000
    ).toFixed(2); // Convert from smallest units
    const draftsWaitingForApproval = dashboardData.draftsWaitingForApproval;

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
              href={`/gigs/create`}
            >
              Post a Gig
            </Button>
          </Group>
        </GradientBanner>
        <Group justify="space-between" align="center" gap="md" wrap="nowrap">
          <GlassCard className={classes.card}>
            <GlassCardTitle>Total Gigs</GlassCardTitle>
            <Text className={classes.valueWrapper}>
              <span className={classes.amount}>
                {totalGigsCreated.toLocaleString()}
              </span>
              <span className={classes.currency}>Gigs</span>
            </Text>
          </GlassCard>
          <GlassCard className={classes.card}>
            <GlassCardTitle>Total Spent</GlassCardTitle>
            <Text className={classes.valueWrapper}>
              <span className={classes.amount}>${totalAmountSpent}</span>
              <span className={classes.currency}>USD</span>
            </Text>
          </GlassCard>
          <GlassCard className={classes.card}>
            <GlassCardTitle>Total Escrowed</GlassCardTitle>
            <Text className={classes.valueWrapper}>
              <span className={classes.amount}>${totalEscrowedAmount}</span>
              <span className={classes.currency}>USD</span>
            </Text>
          </GlassCard>
        </Group>
        <Grid>
          <GridCol span={{ base: 12 }}>
            <GlassCard>
              <GlassCardTitle>Recent Gig Updates</GlassCardTitle>
              {formattedActivityLogs.length > 0 ? (
                <Table
                  columns={[
                    { key: "title", label: "Title" },
                    { key: "activity", label: "Gig" },
                    { key: "createdAt", label: "When?" },
                  ]}
                  data={formattedActivityLogs}
                />
              ) : (
                <Text size="sm" c="dimmed">
                  No recent activity.
                </Text>
              )}
            </GlassCard>
          </GridCol>
          <GridCol span={{ base: 12 }}>
            <GlassCard>
              <GlassCardTitle>Drafts Waiting for Approval</GlassCardTitle>
              <Box>
                {draftsWaitingForApproval > 0 ? (
                  <Group align="center">
                    <Badge size="lg" color="red">
                      {draftsWaitingForApproval}
                    </Badge>
                    <Text>
                      You have {draftsWaitingForApproval} draft
                      {draftsWaitingForApproval > 1 ? "s" : ""} waiting for your
                      approval.
                    </Text>
                    <Button
                      variant="primary"
                      size="small"
                      component={Link}
                      href="/drafts"
                    >
                      Review Drafts
                    </Button>
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    No drafts are currently waiting for your approval.
                  </Text>
                )}
              </Box>
            </GlassCard>
          </GridCol>
        </Grid>
      </Stack>
    );
  }

  // ======== Render Ghostwriter Dashboard ========
  if (dashboardData.role === ERoles.GHOSTWRITER) {
    // Format data for display
    const totalActiveInvites = dashboardData.totalActiveInvites;
    const totalActiveProjects = dashboardData.totalActiveProjects;
    const totalEarnings = (
      parseInt(dashboardData.totalEarnings) / 1_000_000
    ).toFixed(2); // Convert from smallest units
    const draftsInProgress = dashboardData.draftsInProgress;

    return (
      <Stack gap="md" w="100%">
        <GradientBanner variant="purple-blue">
          <Group justify="space-between" align="center">
            <div>
              <Text size="md" fw={700} c="white">
                Ready to write?
              </Text>
              <Text c="white" opacity={0.9} size="xs">
                Check for new invitations and manage your current projects.
              </Text>
            </div>
            <Button
              variant="white"
              size="small"
              component={Link}
              href={`/gigs`}
            >
              See Invitations
            </Button>
          </Group>
        </GradientBanner>
        <Group justify="space-between" align="center" gap="md" wrap="nowrap">
          <GlassCard className={classes.card}>
            <GlassCardTitle>Active Invites</GlassCardTitle>
            <Text className={classes.valueWrapper}>
              <span className={classes.amount}>{totalActiveInvites}</span>
              <span className={classes.currency}>Invites</span>
            </Text>
          </GlassCard>
          <GlassCard className={classes.card}>
            <GlassCardTitle>Active Projects</GlassCardTitle>
            <Text className={classes.valueWrapper}>
              <span className={classes.amount}>{totalActiveProjects}</span>
              <span className={classes.currency}>Projects</span>
            </Text>
          </GlassCard>
          <GlassCard className={classes.card}>
            <GlassCardTitle>Total Earned</GlassCardTitle>
            <Text className={classes.valueWrapper}>
              <span className={classes.amount}>${totalEarnings}</span>
              <span className={classes.currency}>USD</span>
            </Text>
          </GlassCard>
        </Group>
        <Grid>
          <GridCol span={{ base: 12 }}>
            <GlassCard>
              <GlassCardTitle>Recent Activity</GlassCardTitle>
              {formattedActivityLogs.length > 0 ? (
                <Table
                  columns={[
                    { key: "title", label: "Title" },
                    { key: "activity", label: "Gig" },
                    { key: "createdAt", label: "When?" },
                  ]}
                  data={formattedActivityLogs}
                />
              ) : (
                <Text size="sm" c="dimmed">
                  No recent activity.
                </Text>
              )}
            </GlassCard>
          </GridCol>
          <GridCol span={{ base: 12 }}>
            <GlassCard>
              <GlassCardTitle>Drafts in Progress</GlassCardTitle>
              <Box p="sm">
                {draftsInProgress > 0 ? (
                  <Group align="center">
                    <Badge size="lg" color="blue">
                      {draftsInProgress}
                    </Badge>
                    <Text>
                      You have {draftsInProgress} draft
                      {draftsInProgress > 1 ? "s" : ""} in progress.
                    </Text>
                    <Button
                      variant="primary"
                      size="small"
                      component={Link}
                      href="/my-projects"
                    >
                      View My Drafts
                    </Button>
                  </Group>
                ) : (
                  <Text size="sm" c="dimmed">
                    You don&apos;t have any drafts in progress.
                  </Text>
                )}
              </Box>
            </GlassCard>
          </GridCol>
        </Grid>
      </Stack>
    );
  }

  // Fallback for unknown role
  return (
    <Alert color="yellow" title="Role Not Detected">
      We couldn&apos;t determine your user role. Please try refreshing the page.
    </Alert>
  );
};

export default DashboardPage;
