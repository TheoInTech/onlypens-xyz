import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { adminDb } from "@/lib/firebase-admin";
import { GigFormSchema } from "@/schema/gig.schema";
import { ERoles } from "@/stores/constants";
import { db as clientDb } from "@/lib/firebase-client";
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore";
import { request as graphqlRequest } from "graphql-request";
import { GET_GHOSTWRITER_INVITATIONS } from "@/graphql";
import { IInvitationsResponse } from "@/schema/subgraph.schema";

/**
 * POST /api/gigs
 * Creates a new gig metadata in Firebase after it's been created on chain
 */
export async function POST(request: NextRequest) {
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

    // Verify the user is a creator
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

    const userData = userDoc.data();
    if (userData.role !== ERoles.CREATOR) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Only creators can create gigs.",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = GigFormSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Invalid data provided",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const gigData = validationResult.data;

    // Verify the creator address matches the authenticated user
    if (gigData.creatorAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "You can only create gigs for your own address.",
        },
        { status: 403 }
      );
    }

    // Get the timestamp for creation/update
    const now = Date.now();

    // Prepare metadata to save to Firebase
    const metadata = {
      ...gigData,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firebase
    const gigRef = adminDb.collection("gigs").doc(gigData.packageId.toString());
    await gigRef.set(metadata);

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        id: gigData.packageId.toString(),
        ...metadata,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error creating gig:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to create gig.",
      },
      { status: 500 }
    );
  }
}

// Subgraph URL and headers configuration
const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
const GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY!;

// Headers for authorization if API key is available
const headers = { Authorization: `Bearer ${GRAPH_API_KEY}` };

/**
 * GET /api/gigs
 * Get all gigs for the current creator
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

    // Get user role
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

    const userData = userDoc.data();
    const isCreator = userData.role === ERoles.CREATOR;

    let gigs = [];

    if (isCreator) {
      // If creator, get gigs created by this user from Firebase
      const gigsSnapshot = await adminDb
        .collection("gigs")
        .where("creatorAddress", "==", walletAddress)
        .orderBy("createdAt", "desc")
        .get();

      gigs = gigsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } else {
      // If ghostwriter, get gigs from the subgraph via accepted invitations
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

      try {
        // Fetch accepted invitations from subgraph
        const invitationsResponse = await graphqlRequest<IInvitationsResponse>(
          SUBGRAPH_URL,
          GET_GHOSTWRITER_INVITATIONS,
          { ghostwriterId: walletAddress, first: 100 },
          headers
        );

        // Transform invitation data to match expected gig format
        gigs =
          invitationsResponse.invitations?.map((invitation) => ({
            id: invitation.package?.packageId,
            packageId: invitation.package?.packageId,
            creatorAddress: invitation.package?.creator?.id,
            assignedWriter: walletAddress,
            status: invitation.package?.status,
            totalAmount: invitation.package?.totalAmount,
            expiresAt: invitation.package?.expiresAt,
            createdAt: Number(invitation.package?.createdAt) * 1000, // Convert to milliseconds
            // Additional information that might be needed by the frontend
            invitedAt: Number(invitation.invitedAt) * 1000,
            respondedAt: Number(invitation.respondedAt) * 1000,
            transactionHash:
              invitation.transactionHash || invitation.package?.transactionHash,
          })) || [];

        // After getting invitation data from subgraph, fetch metadata from Firestore for each gig
        const gigsWithMetadata = await Promise.all(
          gigs.map(async (gig) => {
            try {
              // Make sure we have a valid document ID
              const docId = gig.packageId
                ? gig.packageId.toString()
                : gig.id?.toString();

              if (!docId) {
                console.warn("Missing valid document ID for gig:", gig);
                return gig;
              }

              // Try to get the metadata from Firestore
              const gigRef = adminDb.collection("gigs").doc(docId);
              const gigDoc = await gigRef.get();

              if (gigDoc.exists) {
                // Merge the subgraph data with Firestore metadata
                return {
                  ...gig,
                  ...gigDoc.data(),
                };
              }

              // If no metadata exists, just return the subgraph data
              return gig;
            } catch (error) {
              console.warn(`Failed to fetch metadata for gig:`, error);
              // Return the original gig data if we can't get metadata
              return gig;
            }
          })
        );

        // Replace gigs with enriched data
        gigs = gigsWithMetadata;
      } catch (error) {
        console.error("Error fetching ghostwriter gigs from subgraph:", error);
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: "Failed to fetch gigs from subgraph.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: gigs,
      error: null,
    });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to fetch gigs.",
      },
      { status: 500 }
    );
  }
}
