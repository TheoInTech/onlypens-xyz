"use client";

import { Grid, GridCol, Group, Modal, Stack, Tabs, Text } from "@mantine/core";
import React from "react";
import classes from "./ghostwriter-profile.module.css";
import { IUser } from "@/schema/user.schema";
import { IconNumber1, IconNumber3, IconNumber2 } from "@tabler/icons-react";
import { Textarea } from "@/components";

interface IGhostwriterProfile {
  isOpen: boolean;
  onClose: () => void;
  ghostwriter: IUser;
}

export const GhostwriterProfile = ({
  isOpen,
  onClose,
  ghostwriter,
}: IGhostwriterProfile) => {
  return (
    <Modal.Root opened={isOpen} onClose={onClose} centered size="xl">
      <Modal.Overlay className={classes.progressModalOverlay} />
      <Modal.Content className={classes.progressModalContent}>
        <Modal.Body className={classes.progressModalBody}>
          <Stack gap="0">
            <Text c="white" size="xl" fw={800} truncate>
              {ghostwriter.displayName}
            </Text>
            <Text c="white" size="xs" fw={400}>
              {ghostwriter.about}
            </Text>
          </Stack>
          <Stack gap="xs">
            <Text c="white" size="sm" fw={600}>
              How {ghostwriter.displayName} matches you?
            </Text>
            <Text
              c="white"
              size="xs"
              fw={400}
              className={classes.writingPersona}
            >
              {ghostwriter.matchmaker?.writingPersona}{" "}
              {ghostwriter.matchmaker?.idealMatchDescription}
            </Text>
          </Stack>
          {/* Sample writing style */}
          <Stack gap="xs">
            <Text c="white" size="sm" fw={600}>
              Sample work
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
                <Textarea h={240} value={ghostwriter.samples[0]} disabled />
              </Tabs.Panel>

              <Tabs.Panel value="sample-2">
                <Textarea h={240} value={ghostwriter.samples[1]} disabled />
              </Tabs.Panel>

              <Tabs.Panel value="sample-3">
                <Textarea h={240} value={ghostwriter.samples[2]} disabled />
              </Tabs.Panel>
            </Tabs>
          </Stack>
          <Stack gap="xs">
            <Text c="white" size="sm" fw={600}>
              Contet Types
            </Text>
            <Group gap="xs">
              {ghostwriter.contentTypeKeywords?.map((keyword) => (
                <Text
                  c="white"
                  size="xs"
                  fw={400}
                  key={keyword}
                  className={classes.pill}
                >
                  {keyword}
                </Text>
              ))}
            </Group>
          </Stack>
          <Stack gap="xs">
            <Text c="white" size="sm" fw={600}>
              Niche & Topics
            </Text>
            <Group gap="xs">
              {ghostwriter.nicheKeywords?.map((keyword) => (
                <Text
                  c="white"
                  size="xs"
                  fw={400}
                  key={keyword}
                  className={classes.pill}
                >
                  {keyword}
                </Text>
              ))}
            </Group>
          </Stack>
          <Grid>
            <GridCol span={6}>
              <Stack gap="xs">
                <Text c="white" size="sm" fw={600}>
                  Strengths
                </Text>
                <Group gap="xs">
                  {ghostwriter.matchmaker?.strengths.map((keyword) => (
                    <Text
                      c="white"
                      size="xs"
                      fw={400}
                      key={keyword}
                      className={classes.pill}
                    >
                      {keyword}
                    </Text>
                  ))}
                </Group>
              </Stack>
            </GridCol>
            <GridCol span={6}>
              <Stack gap="xs">
                <Text c="white" size="sm" fw={600}>
                  Weaknesses
                </Text>
                <Group gap="xs">
                  {ghostwriter.matchmaker?.weaknesses.map((keyword) => (
                    <Text
                      c="white"
                      size="xs"
                      fw={400}
                      key={keyword}
                      className={classes.pill}
                    >
                      {keyword}
                    </Text>
                  ))}
                </Group>
              </Stack>
            </GridCol>
          </Grid>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
