"use client";

import React from "react";
import {
  Stack,
  Group,
  Text,
  Grid,
  GridCol,
  Container,
  Loader,
} from "@mantine/core";
import { Button, GigCard } from "@/components";
import Link from "next/link";
import classes from "./gigs.module.css";
import useGigs from "@/hooks/useGigs";

const MyGigsPage = () => {
  const { gigsData, isLoadingGigs } = useGigs();

  if (isLoadingGigs) {
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
        <Text>Loading your gigs...</Text>
      </Container>
    );
  }

  if (!gigsData) {
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
        <Text>Gigs not found. Please try again.</Text>
      </Container>
    );
  }

  return (
    <Stack w="100%">
      {/* Filters, Sorting, Search*/}
      <Group align="center" justify="space-between">
        <Text>My Gigs ({gigsData.length})</Text>
        <Button size="small" component={Link} href={`/gigs/create`}>
          Post a Gig
        </Button>
      </Group>
      {/* Gigs List */}
      <Stack w="100%">
        {gigsData.length > 0 ? (
          <Grid>
            {gigsData.map((gig) => (
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
