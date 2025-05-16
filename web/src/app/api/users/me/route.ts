import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserSchema } from "@/schema/user.schema";
import { db as clientDb } from "@/lib/firebase-client"; // For GET requests
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore"; // For GET requests
import { adminDb } from "@/lib/firebase-admin"; // Import Admin SDK

// Get current user profile (uses client SDK, respects rules for client-side scenarios)
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const walletAddress = token.sub;
    const userRef = clientDoc(clientDb, "users", walletAddress);
    const userDoc = await clientGetDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(null); // Or { error: "User not found" }, { status: 404 }
    }

    return NextResponse.json(userDoc.data());
  } catch (error) {
    console.error("Error getting user profile:", error);
    return NextResponse.json(
      { error: "Failed to get user profile" },
      { status: 500 }
    );
  }
}

// Save onboarding data (uses Admin SDK, bypasses rules)
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.sub) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const walletAddress = token.sub;
    const body = await request.json();

    if (body.address !== walletAddress) {
      return NextResponse.json(
        { error: "Unauthorized. You can only update your own profile." },
        { status: 403 }
      );
    }

    // Check if wallet address is already used (using Admin SDK)
    const userCheckRef = adminDb.collection("users").doc(walletAddress);
    const userCheckDoc = await userCheckRef.get();

    if (userCheckDoc.exists) {
      return NextResponse.json(
        { error: "Wallet address already used" },
        { status: 400 }
      );
    }

    const validationResult = UserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid data provided",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const now = Date.now();
    const userData = {
      ...validationResult.data,
      createdAt: validationResult.data.createdAt || now,
      updatedAt: now,
    };

    // Save user data to Firestore using Admin SDK
    const userRefAdmin = adminDb.collection("users").doc(walletAddress);
    await userRefAdmin.set(userData);

    return NextResponse.json({
      success: true,
      message: "User profile saved successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error saving user profile:", error);
    // Consider specific error handling for Firebase Admin SDK errors if needed
    return NextResponse.json(
      { error: "Failed to save user profile" },
      { status: 500 }
    );
  }
}
