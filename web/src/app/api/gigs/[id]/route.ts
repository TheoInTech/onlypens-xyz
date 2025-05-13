import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { adminDb } from "@/lib/firebase-admin";
import { db as clientDb } from "@/lib/firebase-client";
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore";

/**
 * GET /api/gigs/[id]
 * Get a single gig by ID with its metadata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the gig from Firebase
    const gigId = params.id;
    const gigRef = adminDb.collection("gigs").doc(gigId);
    const gigDoc = await gigRef.get();

    if (!gigDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Gig not found.",
        },
        { status: 404 }
      );
    }

    const gigData = gigDoc.data();

    // Check permissions - user should be either the creator or assigned writer
    const isCreator =
      gigData?.creatorAddress.toLowerCase() === walletAddress.toLowerCase();
    const isAssignedWriter =
      gigData?.assignedWriter?.toLowerCase() === walletAddress.toLowerCase();

    if (!isCreator && !isAssignedWriter) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "You don't have permission to view this gig.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: gigId,
        ...gigData,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching gig:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to fetch gig details.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/gigs/[id]
 * Update a gig's metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the gig from Firebase
    const gigId = params.id;
    const gigRef = adminDb.collection("gigs").doc(gigId);
    const gigDoc = await gigRef.get();

    if (!gigDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Gig not found.",
        },
        { status: 404 }
      );
    }

    const existingGigData = gigDoc.data();

    // Only the creator can update gig details
    if (
      existingGigData?.creatorAddress.toLowerCase() !==
      walletAddress.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Only the creator can update this gig.",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Only allow updating certain fields - prevent overwriting critical fields
    const updatableFields = [
      "title",
      "description",
      "contentType",
      "toneKeywords",
      "nicheKeywords",
      "deadline",
    ];

    const updates: Record<string, string | number | string[] | null> = {};

    // Extract only the allowed fields
    for (const field of updatableFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Add updatedAt timestamp
    updates.updatedAt = Date.now();

    // Update the document
    await gigRef.update(updates);

    // Get the updated document
    const updatedGigDoc = await gigRef.get();
    const updatedGigData = updatedGigDoc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: gigId,
        ...updatedGigData,
      },
      error: null,
    });
  } catch (error) {
    console.error("Error updating gig:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to update gig.",
      },
      { status: 500 }
    );
  }
}
