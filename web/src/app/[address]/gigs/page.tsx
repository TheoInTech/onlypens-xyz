import React from "react";
import { Stack, Group, Text, Grid, GridCol } from "@mantine/core";
import { getGigs } from "@/services/gigs.service";
import { GigCard } from "@/components";
import Link from "next/link";

interface IMyGigsPage {
  params: {
    address: string;
  };
}

const MyGigsPage = async ({ params }: IMyGigsPage) => {
  const { address } = await params;
  const gigs = await getGigs(address?.toString());

  return (
    <Stack>
      {/* Filters, Sorting, Search*/}
      <Group>
        <Text>My Gigs ({gigs.length})</Text>
      </Group>
      {/* Gigs List */}
      <Stack>
        {gigs.length > 0 ? (
          <Grid>
            {gigs.map((gig) => (
              <GridCol span={3} key={gig.onchainGig.gigId}>
                <Link
                  href={`/${address}/gigs/${gig.onchainGig.gigId}`}
                  style={{ textDecoration: "none" }}
                >
                  <GigCard {...gig} />
                </Link>
              </GridCol>
            ))}
          </Grid>
        ) : (
          <Text>No gigs found</Text>
        )}
      </Stack>
    </Stack>
  );
};

export default MyGigsPage;
