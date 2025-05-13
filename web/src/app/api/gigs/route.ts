import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { adminDb } from "@/lib/firebase-admin";
import { GigFormSchema } from "@/schema/gig.schema";
import { ERoles } from "@/stores/constants";
import { db as clientDb } from "@/lib/firebase-client";
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore";

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

    // Get gigs from Firebase
    let gigsSnapshot;

    if (isCreator) {
      // If creator, get gigs created by this user
      gigsSnapshot = await adminDb
        .collection("gigs")
        .where("creatorAddress", "==", walletAddress)
        .orderBy("createdAt", "desc")
        .get();
    } else {
      // If ghostwriter, get gigs where this user is assigned or invited
      // This is a simplified approach - in a real app, you might need a more complex query
      gigsSnapshot = await adminDb
        .collection("gigs")
        .where("assignedWriter", "==", walletAddress)
        .orderBy("createdAt", "desc")
        .get();
    }

    const gigs = gigsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
