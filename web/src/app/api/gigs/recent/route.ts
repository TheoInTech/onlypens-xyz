import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db as clientDb } from "@/lib/firebase-client";
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { onlyPensAbi } from "@/hooks/abi-generated";
import { request as graphqlRequest } from "graphql-request";
import { GET_CREATOR_RECENT_GIG } from "@/graphql/creator-queries";
import getConfig from "@/lib/blockchain-config";

// Subgraph URL and headers configuration
const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
const GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY!;

// Headers for authorization if API key is available
const headers = { Authorization: `Bearer ${GRAPH_API_KEY}` };

/**
 * GET /api/gigs/recent
 * Gets the most recent GigPackageCreated event from the subgraph for a specific creator
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
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
        },
        { status: 401 }
      );
    }

    const walletAddress = token.sub;

    // Get user profile to check if exists
    const userRef = clientDoc(clientDb, "users", walletAddress);
    const userDoc = await clientGetDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "User not found.",
        },
        { status: 404 }
      );
    }

    // Check if subgraph URL is configured
    if (!SUBGRAPH_URL) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Subgraph URL is not configured.",
        },
        { status: 500 }
      );
    }

    // The contract address
    const contractAddress = getConfig().onlyPensAddress;

    if (!contractAddress) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Contract address not configured",
        },
        { status: 500 }
      );
    }

    // Fetch recent gig data from the subgraph
    interface IRecentGigResponse {
      gigPackageCreatedEvents: Array<{
        id: string;
        packageId: string;
        creator: string;
        amount: string;
        expiresAt: string;
        blockNumber: string;
        blockTimestamp: string;
        transactionHash: string;
      }>;
    }

    const recentGigResponse = await graphqlRequest<IRecentGigResponse>(
      SUBGRAPH_URL,
      GET_CREATOR_RECENT_GIG,
      { creatorId: walletAddress.toLowerCase() },
      headers
    );

    if (!recentGigResponse.gigPackageCreatedEvents?.length) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "No package creation events found for this creator",
        },
        { status: 404 }
      );
    }

    const mostRecentEvent = recentGigResponse.gigPackageCreatedEvents[0];
    const packageId = Number(mostRecentEvent.packageId);

    // Create a viem public client to get additional details
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL),
    });

    // Get more details about the package using the contract
    const packageDetails = await publicClient.readContract({
      address: contractAddress,
      abi: onlyPensAbi,
      functionName: "getPackageDetails",
      args: [BigInt(packageId)],
    });

    // Format the package data for the response
    const packageData = {
      packageId,
      creator: mostRecentEvent.creator,
      amount: mostRecentEvent.amount,
      expiresAt: Number(mostRecentEvent.expiresAt),
      blockNumber: Number(mostRecentEvent.blockNumber),
      blockTimestamp: Number(mostRecentEvent.blockTimestamp),
      transactionHash: mostRecentEvent.transactionHash,
      // Add package details from the contract
      createdAt: Number(packageDetails[3]), // createdAt value
      lastUpdated: Number(packageDetails[4]), // lastUpdated value
      status: Number(packageDetails[6]), // status value
      numDeliverables: Number(packageDetails[7]), // numDeliverables value
    };

    return NextResponse.json({
      success: true,
      data: packageData,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching recent gig:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to fetch recent gig from subgraph.",
      },
      { status: 500 }
    );
  }
}
