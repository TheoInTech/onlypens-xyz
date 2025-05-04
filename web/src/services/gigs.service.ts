import { mockGigMetadata, mockOnchainGigs } from "@/_mock/mockGigs";
import { EActivityType } from "@/schema/enum.schema";
import { IGig } from "@/schema/gig.schema";

// Use mock data for now
export const getGigs = async (
  walletAddress: string | undefined
): Promise<IGig[]> => {
  if (!walletAddress) {
    return [];
  }

  const onchainGigs = mockOnchainGigs[walletAddress] || [];
  const offchainGigsData = mockGigMetadata;

  const gigs = onchainGigs.map((onchainGig) => {
    const metadata = offchainGigsData[onchainGig.gigId];

    // Return combined gig data
    return {
      onchainGig,
      metadata,
      event: EActivityType.GIG_CREATED,
    };
  });

  return gigs;
};

// TODO: This is a temporary function to get a gig by ID
export const getGig = async (gigId: string, address: string): Promise<IGig> => {
  if (!gigId || !address) {
    throw new Error("Missing required parameters");
  }

  // Get onchain gig data
  const onchainGigList = Object.values(mockOnchainGigs).flat();
  const onchainGig = onchainGigList.find((gig) => gig.gigId === gigId);

  if (!onchainGig) {
    throw new Error(`Gig with ID ${gigId} not found`);
  }

  // Get metadata
  const metadata = mockGigMetadata[gigId];
  if (!metadata) {
    throw new Error(`Metadata for gig ID ${gigId} not found`);
  }

  // Check if the requester is the creator or the assigned writer
  const isCreator = onchainGig.creator === address;
  const isAssignedWriter = onchainGig.writer === address;

  // Check if the requester is in the invited ghostwriters list
  const isInvitedWriter =
    metadata.invitedGhostwriters?.includes(address) || false;

  if (!isCreator && !isAssignedWriter && !isInvitedWriter) {
    throw new Error(
      "Unauthorized: Only the creator and invited/assigned writers can access this gig"
    );
  }

  // Return combined gig data
  return {
    onchainGig,
    metadata,
    event: EActivityType.GIG_CREATED,
  };
};
