import { EActivityType, ENicheKeywords } from "@/schema/enum.schema";
import {
  GigApiResponseSchema,
  GigFormSchema,
  GigStatus,
  IGig,
  IGigForm,
  IOnchainGig,
  type IGigApiResponse,
} from "@/schema/gig.schema";

/**
 * Fetches all gigs for the current user
 */
export const getGigs = async (): Promise<IGig[]> => {
  try {
    const response = await fetch("/api/gigs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch gigs");
    }

    const { data } = await response.json();

    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Transform API data to match the IGig structure expected by the app
    const gigs = data.map((gig) => {
      // Extract onchain data
      const onchainGig: IOnchainGig = {
        gigId: gig.packageId.toString(),
        creator: gig.creatorAddress,
        writer: gig.assignedWriter || null,
        amount: (Number(gig.totalAmount) * 10 ** 6).toString(),
        status:
          gig.status != null
            ? (Number(gig.status) as GigStatus)
            : GigStatus.PENDING,
        createdAt: gig.createdAt,
        lastUpdated: gig.updatedAt,
        expiresAt: gig.expiresAt,
        numDeliverables: gig.numberOfDeliverables,
      };

      // Extract metadata
      const metadata = {
        title: gig.title,
        description: gig.description,
        deliverables: gig.deliverables || [],
        toneKeywords: gig.toneKeywords,
        nicheKeywords: gig.nicheKeywords,
        deadline: gig.deadline,
        referenceWritings: gig.referenceWritings || [],
        submissions: gig.submissions || [],
        history: gig.history || [],
        ghostwriters: gig.ghostwriters || [],
      };

      // Return combined gig data
      return {
        onchainGig,
        metadata,
        event: EActivityType.GIG_CREATED,
        invitations: gig.invitations || null,
      };
    });

    return gigs;
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return [];
  }
};

/**
 * Fetches a single gig by ID
 */
export const getGig = async (gigId: string): Promise<IGig> => {
  try {
    if (!gigId) {
      throw new Error("Missing gig ID");
    }

    const response = await fetch(`/api/gigs/${gigId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to fetch gig with ID ${gigId}`);
    }

    const responseJson = await response.json();

    // Handle the case where invitations might contain simplified ghostwriter objects
    if (responseJson.data && responseJson.data.invitations) {
      try {
        // Deduplicate invitations by ID to prevent duplicates
        if (responseJson.data.invitations.allInvited) {
          // Use a Map to deduplicate by ID
          const uniqueInvitations = new Map();

          responseJson.data.invitations.allInvited.forEach(
            (invitation: { id: string }) => {
              uniqueInvitations.set(invitation.id, invitation);
            }
          );

          // Replace with deduplicated array
          responseJson.data.invitations.allInvited = Array.from(
            uniqueInvitations.values()
          );
        }

        // Do the same for accepted and declined invitations
        if (responseJson.data.invitations.accepted) {
          const uniqueAccepted = new Map();
          responseJson.data.invitations.accepted.forEach(
            (invitation: { id: string }) => {
              uniqueAccepted.set(invitation.id, invitation);
            }
          );
          responseJson.data.invitations.accepted = Array.from(
            uniqueAccepted.values()
          );
        }

        if (responseJson.data.invitations.declined) {
          const uniqueDeclined = new Map();
          responseJson.data.invitations.declined.forEach(
            (invitation: { id: string }) => {
              uniqueDeclined.set(invitation.id, invitation);
            }
          );
          responseJson.data.invitations.declined = Array.from(
            uniqueDeclined.values()
          );
        }

        // Pre-process the invitations to ensure ghostwriter objects have the required fields
        // This is a workaround for the schema validation
        if (responseJson.data.invitations.allInvited) {
          responseJson.data.invitations.allInvited =
            responseJson.data.invitations.allInvited.map(
              (invitation: {
                ghostwriter: { address?: string; displayName?: string };
              }) => {
                if (
                  invitation.ghostwriter &&
                  !invitation.ghostwriter.displayName
                ) {
                  const address = invitation.ghostwriter.address;
                  // Create a minimum viable ghostwriter object that will pass validation
                  return {
                    ...invitation,
                    ghostwriter: {
                      address,
                      displayName: `Ghostwriter ${address?.substring(0, 6)}`,
                      about:
                        "Invited ghostwriter - profile will be loaded when available",
                      role: "ghostwriter",
                      samples: ["", "", ""],
                      nicheKeywords: ["OTHER"],
                      contentTypeKeywords: [],
                      toneKeywords: [],
                      isOnboarded: true,
                      createdAt: Date.now(),
                      ratePerWord: 0.1,
                    },
                  };
                }
                return invitation;
              }
            );
        }

        // Do the same for accepted invitations
        if (responseJson.data.invitations.accepted) {
          responseJson.data.invitations.accepted =
            responseJson.data.invitations.accepted.map(
              (invitation: {
                ghostwriter: { address?: string; displayName?: string };
              }) => {
                if (
                  invitation.ghostwriter &&
                  !invitation.ghostwriter.displayName
                ) {
                  const address = invitation.ghostwriter.address;
                  return {
                    ...invitation,
                    ghostwriter: {
                      address,
                      displayName: `Ghostwriter ${address?.substring(0, 6)}`,
                      about:
                        "Invited ghostwriter - profile will be loaded when available",
                      role: "ghostwriter",
                      samples: ["", "", ""],
                      nicheKeywords: ["OTHER"],
                      contentTypeKeywords: [],
                      toneKeywords: [],
                      isOnboarded: true,
                      createdAt: Date.now(),
                      ratePerWord: 0.1,
                    },
                  };
                }
                return invitation;
              }
            );
        }

        // Do the same for declined invitations
        if (responseJson.data.invitations.declined) {
          responseJson.data.invitations.declined =
            responseJson.data.invitations.declined.map(
              (invitation: {
                ghostwriter: { address?: string; displayName?: string };
              }) => {
                if (
                  invitation.ghostwriter &&
                  !invitation.ghostwriter.displayName
                ) {
                  const address = invitation.ghostwriter.address;
                  return {
                    ...invitation,
                    ghostwriter: {
                      address,
                      displayName: `Ghostwriter ${address?.substring(0, 6)}`,
                      about:
                        "Invited ghostwriter - profile will be loaded when available",
                      role: "ghostwriter",
                      samples: ["", "", ""],
                      nicheKeywords: ["OTHER"],
                      contentTypeKeywords: [],
                      toneKeywords: [],
                      isOnboarded: true,
                      createdAt: Date.now(),
                      ratePerWord: 0.1,
                    },
                  };
                }
                return invitation;
              }
            );
        }
      } catch (preprocessError) {
        console.error("Error pre-processing invitations:", preprocessError);
        // Continue with parsing attempt even if preprocessing fails
      }
    }

    // Try parsing with safeParse first to handle validation errors
    const result = GigApiResponseSchema.safeParse(responseJson.data);

    if (!result.success) {
      console.error("Zod validation error:", result.error.format());
      console.error(
        "Response data causing validation error:",
        responseJson.data
      );
      throw new Error(`Failed to parse gig data: ${result.error.message}`);
    }

    const apiGig = result.data as IGigApiResponse;

    console.log("getGig data ===>", apiGig);

    if (!apiGig) {
      throw new Error(`Gig with ID ${gigId} not found`);
    }

    const ghostwriters = apiGig.ghostwriters || [];

    // Transform API data to match the IGig structure
    const onchainGig: IOnchainGig = {
      gigId: apiGig.packageId.toString(),
      creator: apiGig.creatorAddress,
      writer: apiGig.assignedWriter || null,
      amount: (Number(apiGig.totalAmount) * 10 ** 6).toString(),
      status:
        apiGig.status != null
          ? (Number(apiGig.status) as GigStatus)
          : GigStatus.PENDING,
      createdAt: apiGig.createdAt,
      lastUpdated: apiGig.updatedAt._seconds,
      expiresAt: apiGig.expiresAt ? Number(apiGig.expiresAt) : null,
      numDeliverables: apiGig.numberOfDeliverables,
    };

    // Extract metadata
    const metadata = {
      title: apiGig.title,
      description: apiGig.description,
      deliverables: apiGig.deliverables || [],
      nicheKeywords: apiGig.nicheKeywords.map(
        (keyword) => keyword as unknown as ENicheKeywords
      ),
      deadline: apiGig.deadline,
      referenceWritings: apiGig.referenceWritings || [],
      matchmaker: apiGig.matchmaker || null,
      submissions: apiGig.submissions || [],
      history: apiGig.history || [],
      ghostwriters: ghostwriters,
    };

    // Return combined gig data
    return {
      onchainGig,
      metadata,
      event: EActivityType.GIG_CREATED,
      // Include invitations data if available
      invitations: apiGig.invitations || null,
    };
  } catch (error) {
    console.error(`Error fetching gig ${gigId}:`, error);
    throw error;
  }
};

/**
 * Creates a new gig in Firebase after on-chain creation
 */
export const createGig = async (gigData: IGigForm): Promise<IGig> => {
  try {
    // Validate data against our schema
    const validatedData = GigFormSchema.parse(gigData);

    // Get the latest on-chain gig data (after the transaction was mined)
    // This ensures we have the correct packageId from the blockchain
    const recentGig = await getRecentGig();

    if (!recentGig) {
      throw new Error(
        "Failed to retrieve the newly created gig from the blockchain"
      );
    }

    // Update the package ID with the one from blockchain
    const updatedGigData = {
      ...validatedData,
      packageId: recentGig.packageId,
      createdAt: recentGig.createdAt,
      status: recentGig.status,
    };

    const response = await fetch("/api/gigs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedGigData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create gig");
    }

    const { data } = await response.json();

    // Transform API data to match the IGig structure
    const onchainGig: IOnchainGig = {
      gigId: data.packageId.toString(),
      creator: data.creatorAddress,
      writer: data.assignedWriter || null,
      amount: data.totalAmount,
      status: GigStatus.PENDING,
      createdAt: data.createdAt,
      lastUpdated: data.updatedAt,
      expiresAt: data.expiresAt,
      numDeliverables: data.numberOfDeliverables,
    };

    // Extract metadata
    const metadata = {
      title: data.title,
      description: data.description,
      deliverables: data.deliverables || [],
      toneKeywords: data.toneKeywords,
      nicheKeywords: data.nicheKeywords,
      deadline: data.deadline,
      referenceWritings: data.referenceWritings || [],
      submissions: [],
      history: [],
      ghostwriters: [],
    };

    // Return combined gig data
    return {
      onchainGig,
      metadata,
      event: EActivityType.GIG_CREATED,
      invitations: null, // No invitations for newly created gigs
    };
  } catch (error) {
    console.error("Error creating gig:", error);
    throw error;
  }
};

/**
 * Updates an existing gig's metadata
 */
export const updateGig = async (
  gigId: string,
  updateData: Partial<{
    title: string;
    description: string;
    deliverables: Array<{
      contentType: string;
      price: string;
      quantity: string;
      requirements?: string;
    }>;
    toneKeywords: string[];
    nicheKeywords: string[];
    deadline: number;
    referenceWritings: string[];
  }>
): Promise<IGig> => {
  try {
    if (!gigId) {
      throw new Error("Missing gig ID");
    }

    const response = await fetch(`/api/gigs/${gigId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update gig ${gigId}`);
    }

    const { data } = await response.json();

    // Transform API data to match the IGig structure
    const onchainGig: IOnchainGig = {
      gigId: data.packageId.toString(),
      creator: data.creatorAddress,
      writer: data.assignedWriter || null,
      amount: data.totalAmount,
      status:
        data.status != null
          ? (Number(data.status) as GigStatus)
          : GigStatus.PENDING,
      createdAt: data.createdAt,
      lastUpdated: data.updatedAt,
      expiresAt: data.expiresAt,
      numDeliverables: data.numberOfDeliverables,
    };

    // Extract metadata
    const metadata = {
      title: data.title,
      description: data.description,
      deliverables: data.deliverables || [],
      toneKeywords: data.toneKeywords,
      nicheKeywords: data.nicheKeywords,
      deadline: data.deadline,
      referenceWritings: data.referenceWritings || [],
      submissions: data.submissions || [],
      history: data.history || [],
      ghostwriters: data.ghostwriters || [],
    };

    // Return combined gig data
    return {
      onchainGig,
      metadata,
      // No specific GIG_UPDATED type exists in the enum, so we use GIG_CREATED as a default
      // In a production app, you might want to add a GIG_UPDATED type to EActivityType
      event: EActivityType.GIG_CREATED,
      // Include invitations data if available
      invitations: data.invitations || null,
    };
  } catch (error) {
    console.error(`Error updating gig ${gigId}:`, error);
    throw error;
  }
};

/**
 * Fetches the most recent gig created by the current user
 * @returns The most recent gig or null if none found
 */
export const getRecentGig = async (): Promise<{
  packageId: number;
  creator: string;
  amount: string;
  expiresAt: number;
  blockNumber: number;
  blockTimestamp: number;
  transactionHash: string;
  createdAt: number;
  lastUpdated: number;
  status: number;
  numDeliverables: number;
} | null> => {
  try {
    const response = await fetch("/api/gigs/recent", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If not found (404), return null instead of throwing
      if (response.status === 404) {
        return null;
      }

      const error = await response.json();
      throw new Error(error.error || "Failed to fetch recent gig");
    }

    const { data } = await response.json();

    if (!data) {
      return null;
    }

    // Return the formatted package data
    return {
      packageId: data.packageId,
      creator: data.creator,
      amount: (Number(data.amount) * 10 ** 6).toString(),
      expiresAt: data.expiresAt,
      blockNumber: data.blockNumber,
      blockTimestamp: data.blockTimestamp,
      transactionHash: data.transactionHash,
      createdAt: data.createdAt,
      lastUpdated: data.lastUpdated,
      status: data.status,
      numDeliverables: data.numDeliverables,
    };
  } catch (error) {
    console.error("Error fetching recent gig:", error);
    return null;
  }
};
