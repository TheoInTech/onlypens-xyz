import React from "react";
import { Stack, Group, Text, Grid, GridCol } from "@mantine/core";
import { getGigs } from "@/services/gigs.service";
import { Button, GigCard } from "@/components";
import Link from "next/link";
import classes from "./gigs.module.css";

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
      <Group align="center" justify="space-between">
        <Text>My Gigs ({gigs.length})</Text>
        <Button size="small" component={Link} href={`/gigs/create`}>
          Post a Gig
        </Button>
      </Group>
      {/* Gigs List */}
      <Stack>
        {gigs.length > 0 ? (
          <Grid>
            {gigs.map((gig) => (
              <GridCol span={3} key={gig.onchainGig.gigId}>
                <Link
                  href={`/gigs/${gig.onchainGig.gigId}`}
                  style={{ textDecoration: "none", padding: 0 }}
                >
                  <GigCard className={classes.gigItem} gig={gig} />
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
