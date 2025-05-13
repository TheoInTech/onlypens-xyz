import { EActivityType } from "@/schema/enum.schema";
import {
  GigFormSchema,
  GigStatus,
  IGig,
  IGigForm,
  IOnchainGig,
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
      };

      // Return combined gig data
      return {
        onchainGig,
        metadata,
        event: EActivityType.GIG_CREATED,
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
  if (!gigId) {
    throw new Error("Missing required parameters");
  }

  try {
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

    const { data } = await response.json();

    if (!data) {
      throw new Error(`Gig with ID ${gigId} not found`);
    }

    console.log("data ==>", data);

    // Transform API data to match the IGig structure
    const onchainGig: IOnchainGig = {
      gigId: data.packageId.toString(),
      creator: data.creatorAddress,
      writer: data.assignedWriter || null,
      amount: (Number(data.totalAmount) * 10 ** 6).toString(),
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
    };

    // Return combined gig data
    return {
      onchainGig,
      metadata,
      event: EActivityType.GIG_CREATED,
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
    };

    // Return combined gig data
    return {
      onchainGig,
      metadata,
      event: EActivityType.GIG_CREATED,
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
    };

    // Return combined gig data
    return {
      onchainGig,
      metadata,
      // No specific GIG_UPDATED type exists in the enum, so we use GIG_CREATED as a default
      // In a production app, you might want to add a GIG_UPDATED type to EActivityType
      event: EActivityType.GIG_CREATED,
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
