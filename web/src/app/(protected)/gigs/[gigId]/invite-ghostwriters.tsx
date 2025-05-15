"use client";

import { Button, GlassCard } from "@/components";
import React, { useState, useMemo, useCallback } from "react";
import classes from "./invite-ghostwriters.module.css";
import {
  ActionIcon,
  Avatar,
  Box,
  Grid,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { IconSend, IconSparkles, IconUserCircle } from "@tabler/icons-react";
import { IGig, GigStatus } from "@/schema/gig.schema";
import { matchGhostwriters } from "@/services/matchmaker.service";
import { useQueryClient } from "@tanstack/react-query";
import useInviteGhostwriters from "@/hooks/useInviteGhostwriters";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import { GhostwriterProfile } from "./ghostwriter-profile";
import { IUser } from "@/schema/user.schema";
import { useWriteOnlyPensInviteGhostwriter } from "@/hooks/abi-generated";

// TODO:
// 1. / Empty state - "You haven't matched with ghostwriters yet" -> Button to match ghostwriters
// 2. "Match more ghostwriters" button to add more to the list of ghostwriters
// 3. / Ghostwriters list
// 4. Invite ghostwriters button per row
// 5. / See ghostwriter profile button per row -> opens modal with ghostwriter profile
// 6. Invite more ghostwriters button once exceeds 3 invites

interface IInviteGhostwriters {
  gig: IGig;
  refetchGig: () => void;
}

export const InviteGhostwriters = ({
  gig,
  refetchGig,
}: IInviteGhostwriters) => {
  const queryClient = useQueryClient();
  const { ghostwriterProfiles, isLoadingGhostwriterProfiles } =
    useInviteGhostwriters(gig.onchainGig.gigId);
  const { writeContractAsync: inviteGhostwriter } =
    useWriteOnlyPensInviteGhostwriter();

  // Debug: Log the entire gig object to inspect the structure
  console.log("Current gig object:", gig);
  console.log("Invitations data:", gig.invitations);

  const [isMatchingGhostwriters, setIsMatchingGhostwriters] =
    useState<boolean>(false);
  const [selectedGhostwriter, setSelectedGhostwriter] = useState<IUser | null>(
    null
  );
  const [progressModalContent, setProgressModalContent] = useState<
    string | undefined
  >();
  const [isRefetching, setIsRefetching] = useState<boolean>(false);

  // Handle first-time fetching errors
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Collect all invited addresses from the API response for checking duplicate invitations
  const alreadyInvitedAddresses = useMemo(() => {
    // Debug log to see what data we have
    console.log("Checking invitations in gig:", gig);
    console.log("Direct access to invitations:", gig.invitations);

    let invitedAddresses: string[] = [];

    // Check for the invitations directly in the gig object
    if (gig.invitations?.allInvited) {
      console.log("Found invitations in gig.invitations");
      invitedAddresses =
        gig.invitations.allInvited?.map((invite) =>
          invite.ghostwriter.address.toLowerCase()
        ) || [];
    }

    console.log("Already invited addresses:", invitedAddresses);
    return invitedAddresses;
  }, [gig]);

  // Memoized function to check if a ghostwriter is already invited
  const isGhostwriterAlreadyInvited = useCallback(
    (address: string): boolean => {
      return alreadyInvitedAddresses.includes(address.toLowerCase());
    },
    [alreadyInvitedAddresses]
  );

  // Memoized function to determine if invite button should be disabled
  const shouldDisableInvite = useCallback(
    (ghostwriter: IUser): boolean => {
      const isInvited = isGhostwriterAlreadyInvited(ghostwriter.address);
      const isPending = gig.onchainGig.status === GigStatus.PENDING;

      // Debug
      console.log(
        `Ghostwriter ${ghostwriter.address}: already invited=${isInvited}, gig pending=${isPending}`
      );

      // If already invited in API or we're in the middle of an operation
      return (
        isInvited ||
        !!progressModalContent ||
        isRefetching ||
        // Don't allow invites if the gig is not in PENDING status
        !isPending
      );
    },
    [
      isGhostwriterAlreadyInvited,
      gig.onchainGig.status,
      progressModalContent,
      isRefetching,
    ]
  );

  const handleOpenGhostwriterProfile = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const ghostwriter = JSON.parse(
        (event.currentTarget as HTMLButtonElement).dataset.ghostwriter || "{}"
      );

      setSelectedGhostwriter(ghostwriter);
    },
    []
  );

  const handleCloseGhostwriterProfile = useCallback(() => {
    setSelectedGhostwriter(null);
  }, []);

  const handleMatchGhostwriters = useCallback(async () => {
    try {
      setIsMatchingGhostwriters(true);
      setFetchError(null);
      const { gigId, matchedGhostwriterAddresses } = await matchGhostwriters(
        gig.onchainGig.gigId,
        gig.onchainGig.creator
      );

      if (matchedGhostwriterAddresses.length > 0) {
        await queryClient.invalidateQueries({ queryKey: ["gig", gigId] });
        await refetchGig();
      }
    } catch (error) {
      console.error(error);
      setFetchError("Failed to match ghostwriters. Please try again.");
    } finally {
      setIsMatchingGhostwriters(false);
    }
  }, [gig.onchainGig.gigId, gig.onchainGig.creator, queryClient, refetchGig]);

  const handleInviteGhostwriter = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const ghostwriter = JSON.parse(
        (event.currentTarget as HTMLButtonElement).dataset.ghostwriter || "{}"
      );

      try {
        setProgressModalContent("Inviting ghostwriter...");
        setFetchError(null);

        await inviteGhostwriter({
          args: [BigInt(gig.onchainGig.gigId), ghostwriter.address],
        });

        await new Promise((resolve) => setTimeout(resolve, 4000));

        setProgressModalContent("Invited ghostwriter! Refreshing list...");
        setIsRefetching(true);

        // Implement retry mechanism with delay for API sync
        let retries = 0;
        const maxRetries = 3;
        let success = false;

        while (retries < maxRetries && !success) {
          try {
            // Wait additional time between retries
            if (retries > 0) {
              await new Promise((resolve) =>
                setTimeout(resolve, 2000 * retries)
              );
              setProgressModalContent(
                `Retrying refresh... (Attempt ${retries + 1})`
              );
            }

            // Invalidate and refetch
            await queryClient.invalidateQueries({
              queryKey: ["gig", gig.onchainGig.gigId],
            });
            await refetchGig();
            success = true;
          } catch (fetchError) {
            console.error(
              `Error fetching updated gig data (attempt ${retries + 1}):`,
              fetchError
            );
            retries++;

            // If this was our last retry, throw to be caught by outer catch
            if (retries >= maxRetries) {
              throw fetchError;
            }
          }
        }

        setProgressModalContent("Successfully invited ghostwriter!");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("Error in invite ghostwriter process:", error);
        setProgressModalContent(
          `Error inviting ghostwriter: ${error instanceof Error ? error.message : "Unknown error"}`
        );

        // Show error message for a moment before clearing
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } finally {
        setProgressModalContent(undefined);
        setIsRefetching(false);
      }
    },
    [gig.onchainGig.gigId, inviteGhostwriter, queryClient, refetchGig]
  );

  // Render functions for UI components
  const renderInviteStatus = useCallback(
    (ghostwriter: IUser) => {
      const isInvited = isGhostwriterAlreadyInvited(ghostwriter.address);

      if (isInvited) {
        return (
          <Text size="xs" c="dimmed" fw={500}>
            Invited
          </Text>
        );
      }

      return (
        <ActionIcon
          aria-label="Invite"
          className={classes.actionIcon}
          onClick={handleInviteGhostwriter}
          data-ghostwriter={JSON.stringify(ghostwriter)}
          disabled={shouldDisableInvite(ghostwriter)}
        >
          <IconSend color="white" />
        </ActionIcon>
      );
    },
    [
      isGhostwriterAlreadyInvited,
      classes.actionIcon,
      handleInviteGhostwriter,
      shouldDisableInvite,
    ]
  );

  return (
    <>
      {!!selectedGhostwriter && (
        <GhostwriterProfile
          isOpen={!!selectedGhostwriter}
          onClose={handleCloseGhostwriterProfile}
          ghostwriter={selectedGhostwriter}
        />
      )}

      {/* Progress Modal */}
      <Modal.Root
        opened={!!progressModalContent}
        onClose={() => {}}
        centered
        size="xl"
      >
        <Modal.Overlay className={classes.progressModalOverlay} />
        <Modal.Content className={classes.progressModalContent}>
          <Stack gap="md" align="center">
            <Loader size="lg" color="purple" />
            <Text size="sm" c="var(--mantine-color-midnight-9)">
              {progressModalContent}
            </Text>
            <Text size="xs" c="dimmed" ta="center">
              Please do not close or refresh the page.
            </Text>
          </Stack>
        </Modal.Content>
      </Modal.Root>

      <Stack gap="sm">
        <Text size="md" fw={500}>
          Ghostwriters for this gig
        </Text>

        {/* Error state */}
        {fetchError && (
          <GlassCard className={classes.fullWidthGlassCard}>
            <Text className={classes.errorText} c="red">
              {fetchError}
            </Text>
            <Button
              variant="white"
              size="small"
              onClick={() => setFetchError(null)}
            >
              Dismiss
            </Button>
          </GlassCard>
        )}

        {/* Loading state */}
        {gig.metadata.ghostwriters &&
          gig.metadata.ghostwriters.length > 0 &&
          (isLoadingGhostwriterProfiles || isRefetching) && (
            <GlassCard className={classes.fullWidthGlassCard}>
              <Stack gap="md" align="center">
                <Loader size="lg" color="purple" />
                <Text size="sm" c="var(--mantine-color-midnight-9)">
                  {isRefetching
                    ? "Refreshing ghostwriter data..."
                    : "Loading ghostwriter profiles..."}
                </Text>
                <Text size="xs" c="dimmed" ta="center">
                  Blockchain data may take a moment to sync
                </Text>
              </Stack>
            </GlassCard>
          )}

        {/* Empty state */}
        {gig.metadata.ghostwriters &&
          gig.metadata.ghostwriters.length === 0 &&
          !isLoadingGhostwriterProfiles &&
          !isRefetching && (
            <GlassCard className={classes.fullWidthGlassCard}>
              <Text className={classes.valueWrapper}>
                You haven&apos;t matched with ghostwriters yet
              </Text>
              <Button
                variant="white"
                size="small"
                leftSection={<IconSparkles />}
                onClick={handleMatchGhostwriters}
                disabled={isMatchingGhostwriters}
              >
                {isMatchingGhostwriters ? "Matching..." : "Match ghostwriters"}
              </Button>
            </GlassCard>
          )}

        {/* With ghostwriters */}
        {gig.metadata.ghostwriters &&
          gig.metadata.ghostwriters.length > 0 &&
          ghostwriterProfiles &&
          ghostwriterProfiles?.length > 0 &&
          !isLoadingGhostwriterProfiles &&
          !isRefetching && (
            <GlassCard className={classes.fullWidthGlassCard}>
              <Stack gap="xl" w="100%">
                {ghostwriterProfiles.map((ghostwriter) => (
                  <Grid key={ghostwriter.address} align="center" gutter={"lg"}>
                    <Grid.Col span={1}>
                      <Avatar color="cyan" radius="xl">
                        {!ghostwriter.avatarUrl ||
                        ghostwriter.avatarUrl === "" ? (
                          getInitials(ghostwriter.displayName)
                        ) : (
                          <Image
                            src={ghostwriter.avatarUrl}
                            alt={ghostwriter.displayName}
                            width={500}
                            height={500}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </Avatar>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Text size="xs" c="white" truncate>
                        {ghostwriter.displayName}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={4}>
                      <Text
                        size="xs"
                        c="white"
                        className={classes.writingPersona}
                      >
                        {ghostwriter.matchmaker?.writingPersona}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Stack gap="xs">
                        {ghostwriter.matchmaker?.tags?.map((tag) => (
                          <Box key={tag} className={classes.ghostwriterTag}>
                            {tag}
                          </Box>
                        ))}
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <Group gap="lg" justify="flex-end">
                        {renderInviteStatus(ghostwriter)}
                        <ActionIcon
                          aria-label="Profile"
                          className={classes.actionIcon}
                          onClick={handleOpenGhostwriterProfile}
                          data-ghostwriter={JSON.stringify(ghostwriter)}
                        >
                          <IconUserCircle color="white" />
                        </ActionIcon>
                      </Group>
                    </Grid.Col>
                  </Grid>
                ))}
              </Stack>
            </GlassCard>
          )}
      </Stack>
    </>
  );
};
