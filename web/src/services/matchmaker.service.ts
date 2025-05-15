import {
  IMatchmaker,
  IMatchmakerMatchResponse,
  IMatchmakerResponse,
  MatchmakerSchema,
} from "@/schema/matchmaker.schema";
import { IUser } from "@/schema/user.schema";

/**
 * Creates a new gig in Firebase after on-chain creation
 */
export const generateMatchmakingData = async (
  data: IMatchmaker
): Promise<IMatchmakerResponse> => {
  try {
    // Validate data against our schema
    const validatedData = MatchmakerSchema.safeParse(data);

    if (!validatedData.success) {
      throw new Error("Invalid matchmaker data");
    }

    const response = await fetch("/api/match-maker", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate brand strategy");
    }

    const matchmakerResponse = await response.json();

    if (!matchmakerResponse || !matchmakerResponse?.success) {
      throw new Error("Failed to generate matchmaking data");
    }

    return matchmakerResponse.data;
  } catch (error) {
    console.error("Error creating gig:", error);
    throw error;
  }
};

/**
 * Match ghostwriters for a gig
 */
export const matchGhostwriters = async (
  gigId: string,
  creator: string
): Promise<{ gigId: string; matchedGhostwriterAddresses: string[] }> => {
  try {
    if (!gigId || !creator) {
      throw new Error("Gig ID and creator address are required");
    }

    const response = await fetch("/api/match-maker/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gigId, creator }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to match ghostwriters");
    }

    const matchmakerResponse: IMatchmakerMatchResponse = await response.json();

    if (!matchmakerResponse || !matchmakerResponse?.success) {
      throw new Error("Failed to match ghostwriters");
    }

    return matchmakerResponse.data;
  } catch (error) {
    console.error("Error creating gig:", error);
    throw error;
  }
};

/**
 * Get ghostwriter profiles for a gig
 */
export const getGhostwriterProfiles = async (
  gigId: string,
  creator: string
): Promise<IUser[]> => {
  try {
    const response = await fetch(
      `/api/match-maker/match?gigId=${gigId}&creator=${creator}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get ghostwriter profiles");
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting ghostwriter profiles:", error);
    throw error;
  }
};
