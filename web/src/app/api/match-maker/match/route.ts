import { adminDb } from "@/lib/firebase-admin";
import { IGig } from "@/schema/gig.schema";
import { IMatchmaker } from "@/schema/matchmaker.schema";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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

    const body: { gigId: string } = await request.json();

    if (!body.gigId) {
      return NextResponse.json(
        { error: "Gig ID is required" },
        { status: 400 }
      );
    }

    const gigId = body.gigId;

    // Get the gig from Firebase
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

    const gig = gigDoc.data() as IGig;
    const matchmakerData = gig.metadata.matchmaker;

    // Start matchmaking and querying on Firestore
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
