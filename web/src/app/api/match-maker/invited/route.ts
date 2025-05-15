import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db as clientDb } from "@/lib/firebase-client";
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore";
import { request as graphqlRequest } from "graphql-request";
import { ERoles } from "@/stores/constants";
import {
  InvitedGhostwritersResponseSchema,
  IInvitedGhostwritersResponse,
  EInvitationStatus,
} from "@/schema/matchmaker.schema";
import { GET_CREATOR_SINGLE_GIG_DETAILS } from "@/graphql/creator-queries";
import { UserSchema } from "@/schema/user.schema";

// Subgraph URL and headers configuration
const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
const GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY!;

// Headers for authorization if API key is available
const headers = GRAPH_API_KEY
  ? { Authorization: `Bearer ${GRAPH_API_KEY}` }
  : undefined;

// GraphQL response interface
interface IGigDetailsResponse {
  package: {
    id: string;
    packageId: string;
    invitations: {
      id: string;
      status: string;
      invitedAt: string;
      respondedAt: string | null;
      ghostwriter: {
        id: string;
      };
      transactionHash: string;
    }[];
    // Other gig details fields that we don't need for this endpoint
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Unauthorized. Please sign in.",
        } satisfies IInvitedGhostwritersResponse,
        { status: 401 }
      );
    }

    if (!SUBGRAPH_URL) {
      console.error("Subgraph URL is not configured.");
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Server configuration error.",
        } satisfies IInvitedGhostwritersResponse,
        { status: 500 }
      );
    }

    const walletAddress = token.sub;
    const userRef = clientDoc(clientDb, "users", walletAddress);
    const userDoc = await clientGetDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "User not found.",
        } satisfies IInvitedGhostwritersResponse,
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData.role !== ERoles.CREATOR) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Forbidden. Only creators can access this resource.",
        } satisfies IInvitedGhostwritersResponse,
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gigId = searchParams.get("gigId");

    if (!gigId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Missing gigId query parameter.",
        } satisfies IInvitedGhostwritersResponse,
        { status: 400 }
      );
    }

    // Fetch gig details with a single query
    const gigDetailsResponse = await graphqlRequest<IGigDetailsResponse>(
      SUBGRAPH_URL,
      GET_CREATOR_SINGLE_GIG_DETAILS,
      { packageId: gigId },
      headers
    );

    // Get all invitations from the response
    const allInvitations = gigDetailsResponse.package?.invitations || [];

    // Function to transform each invitation to match our schema
    const transformInvitation = (invitation: {
      id: string;
      status: string;
      invitedAt: string;
      respondedAt: string | null;
      ghostwriter: { id: string };
      transactionHash: string;
    }) => {
      // Create basic user object with id (address)
      const userObject = UserSchema.parse({
        address: invitation.ghostwriter.id,
        displayName: "",
        about: "",
        role: ERoles.GHOSTWRITER,
        samples: [],
        nicheKeywords: [],
        contentTypeKeywords: [],
        toneKeywords: [],
        isOnboarded: true,
        createdAt: new Date().toISOString(),
      });

      return {
        id: invitation.id,
        status: invitation.status as EInvitationStatus,
        invitedAt: invitation.invitedAt,
        respondedAt: invitation.respondedAt,
        ghostwriter: userObject,
        transactionHash: invitation.transactionHash,
      };
    };

    // Transform and filter invitations
    const allInvited = allInvitations.map(transformInvitation);

    const accepted = allInvitations
      .filter((inv) => inv.status === EInvitationStatus.ACCEPTED)
      .map(transformInvitation);

    const declined = allInvitations
      .filter((inv) => inv.status === EInvitationStatus.DECLINED)
      .map(transformInvitation);

    const responseData = {
      success: true,
      data: {
        allInvited,
        accepted,
        declined,
      },
      error: null,
    } satisfies IInvitedGhostwritersResponse;

    // Validate the response with Zod schema
    const validatedResponse =
      InvitedGhostwritersResponseSchema.parse(responseData);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("API error in /api/match-maker/invited:", error);
    let errorMessage = "Failed to fetch invitation data.";
    if (error instanceof Error) {
      // Refine error message if it's a known GraphQL error or network issue
      if (
        error.message.includes("connect ECONNREFUSED") ||
        error.message.includes("fetch failed")
      ) {
        errorMessage =
          "Could not connect to the data service. Please try again later.";
      } else if (error.message.toLowerCase().includes("invalid id")) {
        // This might indicate a malformed gigId or an issue with how the subgraph handles it.
        errorMessage = "Invalid gigId format or gig not found.";
      }
    }
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: errorMessage,
      } satisfies IInvitedGhostwritersResponse,
      { status: 500 }
    );
  }
}
