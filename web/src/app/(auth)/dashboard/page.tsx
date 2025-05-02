import classes from "./dashboard.module.css";
import { Box, Group, Text } from "@mantine/core";
import { GlassCard, GlassCardTitle } from "@/components";
import React from "react";

const DashboardPage = () => {
  return (
    <Box w="100%">
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
    </Box>
  );
};

export default DashboardPage;
