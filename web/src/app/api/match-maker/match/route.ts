import * as admin from "firebase-admin"; // Import the full admin SDK
import { adminDb } from "@/lib/firebase-admin"; // Assuming adminDb is Firestore instance admin.firestore()
import { GigMetadataSchema, IGigMetadata } from "@/schema/gig.schema";
import { IMatchmakerResponse } from "@/schema/matchmaker.schema";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { IUser } from "@/schema/user.schema";
// FieldValue is now available via admin.firestore.FieldValue

// Define a more specific type for ghostwriter user data

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

    const body: { gigId: string; creator: string } = await request.json();

    if (!body.gigId || !body.creator) {
      return NextResponse.json(
        { error: "Gig ID and creator are required" },
        { status: 400 }
      );
    }

    const { gigId, creator } = body;

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

    const gig = gigDoc.data() as IGigMetadata;
    if (!gig?.matchmaker) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Gig matchmaker profile not found or is incomplete.",
        },
        { status: 400 }
      );
    }
    const gigMatchmakerProfile = gig.matchmaker as IMatchmakerResponse;

    // Helper function to calculate match score
    const calculateMatchScore = (
      gigCriteria: IMatchmakerResponse,
      writerCriteria: IMatchmakerResponse
    ): number => {
      let score = 0;

      const getArrayIntersectionLength = (
        arr1?: string[],
        arr2?: string[]
      ): number => {
        if (!arr1 || !arr2) return 0;
        const stringArr1 = arr1.map(String);
        const stringArr2 = arr2.map(String);
        return stringArr1.filter((value) => stringArr2.includes(value)).length;
      };

      // Score topTone: +2 for each match
      score +=
        getArrayIntersectionLength(
          gigCriteria.topTone,
          writerCriteria.topTone
        ) * 2;

      // Score topNiches: +3 for each match
      score +=
        getArrayIntersectionLength(
          gigCriteria.topNiches,
          writerCriteria.topNiches
        ) * 3;

      // Score complexityLevel: +5 if exact match
      if (
        gigCriteria.complexityLevel &&
        writerCriteria.complexityLevel &&
        gigCriteria.complexityLevel === writerCriteria.complexityLevel
      ) {
        score += 5;
      }

      // Score preferredContentTypes: +1 for each match
      score +=
        getArrayIntersectionLength(
          gigCriteria.preferredContentTypes,
          writerCriteria.preferredContentTypes
        ) * 1;

      // Score tags: +1 for each match
      score +=
        getArrayIntersectionLength(gigCriteria.tags, writerCriteria.tags) * 1;

      // Score strengths: +2 for each of gig's desired strengths the writer has
      score +=
        getArrayIntersectionLength(
          gigCriteria.strengths,
          writerCriteria.strengths
        ) * 2;

      // Penalize if writer's weaknesses include any of the gig's desired strengths
      if (gigCriteria.strengths && writerCriteria.weaknesses) {
        for (const requiredStrength of gigCriteria.strengths) {
          if (writerCriteria.weaknesses.includes(String(requiredStrength))) {
            score -= 3; // Penalty
          }
        }
      }

      return score;
    };

    // Fetch ghostwriters more efficiently
    const usersRef = adminDb.collection("users");
    let ghostwritersQuery: admin.firestore.Query = usersRef.where(
      "role",
      "==",
      "ghostwriter"
    );

    // Filter by complexity level if available in gig profile
    if (gigMatchmakerProfile.complexityLevel) {
      ghostwritersQuery = ghostwritersQuery.where(
        "matchmaker.complexityLevel", // Path to the nested field in the user document
        "==",
        gigMatchmakerProfile.complexityLevel
      );
    }

    // Filter by topNiches if available in gig profile (at least one niche must match)
    // Firestore array-contains-any is limited to 10 values in the comparison array.
    const topNichesToQuery = gigMatchmakerProfile.topNiches
      ?.map(String)
      .slice(0, 10);
    if (topNichesToQuery && topNichesToQuery.length > 0) {
      ghostwritersQuery = ghostwritersQuery.where(
        "matchmaker.topNiches", // Path to the nested field
        "array-contains-any",
        topNichesToQuery
      );
    }

    // We could potentially add another filter for e.g., topTone if complex queries are managed
    // For instance, if gigMatchmakerProfile.topTone is not empty:
    // const topTonesToQuery = gigMatchmakerProfile.topTone?.map(String).slice(0, 10);
    // if (topTonesToQuery && topTonesToQuery.length > 0) {
    //   ghostwritersQuery = ghostwritersQuery.where(
    //     "matchmaker.topTone",
    //     "array-contains-any",
    //     topTonesToQuery
    //   );
    // } // Note: Firestore has limits on combining array-contains-any or 'in' operators.
    //       Chaining them for different fields like this is generally fine.

    const ghostwritersSnapshot = await ghostwritersQuery.get();

    if (ghostwritersSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "No ghostwriters found in the system.",
        },
        { status: 404 }
      );
    }

    const scoredGhostwriters: {
      address: string;
      score: number;
      data: IUser;
    }[] = [];

    ghostwritersSnapshot.forEach((doc) => {
      const writerData = doc.data() as IUser;

      // Prevent gig creator from being matched with their own gig
      // Compare addresses case-insensitively
      if (
        creator &&
        writerData.address &&
        writerData.address.toLowerCase() === creator.toLowerCase()
      ) {
        return; // Skip self
      }

      if (writerData.address && writerData.matchmaker) {
        const score = calculateMatchScore(
          gigMatchmakerProfile,
          writerData.matchmaker
        );
        scoredGhostwriters.push({
          address: writerData.address,
          score,
          data: writerData,
        });
      }
    });

    // Sort ghostwriters by score in descending order
    scoredGhostwriters.sort((a, b) => b.score - a.score);

    // Select top 5 ghostwriters (or fewer if not enough are available)
    const topGhostwriters = scoredGhostwriters.slice(0, 5);
    const topGhostwriterAddresses = topGhostwriters.map((gw) => gw.address);

    // Update the gig document with the matched ghostwriter addresses
    await gigRef.update({
      ghostwriters: topGhostwriterAddresses,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          gigId: gigId,
          matchedGhostwriterAddresses: topGhostwriterAddresses,
        },
        error: null,
      },
      { status: 200 }
    );
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
    const searchParams = request.nextUrl.searchParams;
    const gigId = searchParams.get("gigId");
    const creator = searchParams.get("creator");

    if (!gigId || !creator) {
      return NextResponse.json(
        { error: "Gig ID and creator are required" },
        { status: 400 }
      );
    }

    // 3. Fetch the gig from Firebase
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

    // Use Zod to parse and validate the gig data
    const gigDocData = gigDoc.data();
    const parseResult = GigMetadataSchema.safeParse(gigDocData);

    if (!parseResult.success) {
      console.error("Failed to parse gig data:", parseResult.error.errors);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Gig data is not in the expected format.",
        },
        { status: 500 }
      );
    }

    const gigData = parseResult.data;

    // 4. Verify ownership (assuming onchainGig is correctly part of parsed data)
    if (creator.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Forbidden. You are not the owner of this gig.",
        },
        { status: 403 }
      );
    }

    const ghostwriterAddresses = gigData.ghostwriters;

    if (!ghostwriterAddresses || ghostwriterAddresses.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          error: null,
          message: "No ghostwriters have been matched to this gig yet.",
        },
        { status: 200 }
      );
    }

    // Fetch full profiles of ghostwriters
    // Firestore 'in' query limit is 30. If more, batching would be needed.
    // For 5 writers, this is fine.
    const usersRef = adminDb.collection("users");
    const ghostwriterProfilesQuery = usersRef.where(
      "address",
      "in",
      ghostwriterAddresses
    );
    const ghostwriterProfilesSnapshot = await ghostwriterProfilesQuery.get();

    const ghostwriterProfiles: IUser[] = [];
    ghostwriterProfilesSnapshot.forEach((doc) => {
      // Assuming IGhostwriterUser is the correct type for user documents
      ghostwriterProfiles.push(doc.data() as IUser);
    });

    return NextResponse.json(
      {
        success: true,
        data: ghostwriterProfiles,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching matched ghostwriters:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: `Failed to fetch matched ghostwriters: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
