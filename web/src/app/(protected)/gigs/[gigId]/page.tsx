import { getContentTypeIcon, getTimeUntil } from "@/lib/utils";
import { getGig } from "@/services/gigs.service";
import { Divider, Grid, GridCol, Group, Stack, Text } from "@mantine/core";
import React from "react";
import Image from "next/image";
import classes from "./gig-id.module.css";
import { AmountPill, GlassCard, StatusPill, ToneNichePill } from "@/components";

interface IGigIdPage {
  params: {
    gigId: string;
    address: string;
  };
}

const GigIdPage = async ({ params }: IGigIdPage) => {
  const { gigId, address } = await params;
  const { onchainGig, metadata, event } = await getGig(gigId, address);
  const icon = getContentTypeIcon(metadata.contentType);

  return (
    <Stack gap="lg">
      <GlassCard>
        <Grid gutter="xl">
          <GridCol span={4}>
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
                  Tones:{" "}
                </Text>
                <Group gap="xs">
                  {metadata.toneKeywords.map((tone) => (
                    <ToneNichePill value={tone} size="md" key={tone} />
                  ))}
                </Group>
              </Group>
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
    </Stack>
  );
};

export default GigIdPage;
