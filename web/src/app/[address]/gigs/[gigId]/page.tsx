import { getContentTypeIcon } from "@/lib/utils";
import { getGig } from "@/services/gigs.service";
import { Grid, GridCol, Stack, Text } from "@mantine/core";
import React from "react";
import Image from "next/image";
import classes from "./gig-id.module.css";
import { GlassCard } from "@/components";

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
        <Grid>
          <GridCol span={4}>
            <Image
              src={`/assets/content-types/${icon}`}
              alt="Gig Icon"
              width={1024}
              height={1024}
              className={classes.gigIcon}
            />
          </GridCol>
          <GridCol span={8}>
            <Stack>
              <Text>{metadata.title}</Text>
              <Text>{metadata.description}</Text>
            </Stack>
          </GridCol>
        </Grid>
      </GlassCard>
    </Stack>
  );
};

export default GigIdPage;
