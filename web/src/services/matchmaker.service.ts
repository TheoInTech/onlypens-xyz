import {
  IMatchmaker,
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
export const matchGhostwriters = async (gigId: string): Promise<IUser[]> => {
  try {
    if (!gigId) {
      throw new Error("Matchmaker data is required");
    }

    const response = await fetch("/api/match-maker/match", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gigId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to match ghostwriters");
    }

    const matchmakerResponse = await response.json();

    if (!matchmakerResponse || !matchmakerResponse?.success) {
      throw new Error("Failed to match ghostwriters");
    }

    return matchmakerResponse.data;
  } catch (error) {
    console.error("Error creating gig:", error);
    throw error;
  }
};
