import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { adminDb } from "@/lib/firebase-admin";
import { db as clientDb } from "@/lib/firebase-client";
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore";
import { request as graphqlRequest } from "graphql-request";
import { ERoles } from "@/stores/constants";
import { EInvitationStatus } from "@/schema/matchmaker.schema";
import { GET_PACKAGE_INVITATIONS } from "@/graphql/creator-queries";
import { GET_GHOSTWRITER_INVITATIONS } from "@/graphql";
import { IInvitationsResponse } from "@/schema/subgraph.schema";

// Subgraph URL and headers configuration
const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
const GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY!;

// Headers for authorization if API key is available
const headers = GRAPH_API_KEY
  ? { Authorization: `Bearer ${GRAPH_API_KEY}` }
  : undefined;

// Interface for the direct invitations query
interface IPackageInvitationsResponse {
  packageById: {
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
  } | null;
  packagesByNumber: {
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
  }[];
  invitationsByPackage: {
    id: string;
    status: string;
    invitedAt: string;
    respondedAt: string | null;
    ghostwriter: {
      id: string;
    };
    transactionHash: string;
    package: {
      id: string;
      packageId: string;
    };
  }[];
}

/**
 * GET /api/gigs/[id]
 * Get a single gig by ID with its metadata and invitation data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const userData = userDoc.data();
    const isCreator = userData.role === ERoles.CREATOR;
    const isGhostwriter = userData.role === ERoles.GHOSTWRITER;

    // Get the gig from Firebase
    const { id: gigId } = await params;
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

    // Check if the user is the creator of this gig
    const isGigCreator =
      gigData?.creatorAddress.toLowerCase() === walletAddress.toLowerCase();

    // Check if the ghostwriter has access to this gig via the subgraph
    let isInvitedGhostwriter = false;

    // If user is a ghostwriter, we need to check the subgraph to see if they're associated with this gig
    if (isGhostwriter && !isGigCreator && SUBGRAPH_URL) {
      try {
        // Fetch ghostwriter's invitations from subgraph
        const invitationsResponse = await graphqlRequest<IInvitationsResponse>(
          SUBGRAPH_URL,
          GET_GHOSTWRITER_INVITATIONS,
          { ghostwriterId: walletAddress, first: 100 },
          headers
        );

        // Check if any invitation matches this gig's packageId
        isInvitedGhostwriter =
          invitationsResponse.invitations?.some((invitation) => {
            const packageId = gigData?.packageId?.toString();
            return packageId && invitation.package?.packageId === packageId;
          }) || false;
      } catch (error) {
        console.error("Error checking ghostwriter access:", error);
      }
    }

    // User should be either the creator or an invited ghostwriter
    if (!isGigCreator && !isInvitedGhostwriter) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "You don't have permission to view this gig.",
        },
        { status: 403 }
      );
    }

    // Determine whether to include invitation data
    // We'll include it only for creators since it's creator-specific information
    let invitationData = null;

    if (isGigCreator && isCreator && gigData?.packageId) {
      try {
        // Fetch on-chain data from subgraph
        const packageId = gigData.packageId;
        const packageIdString = packageId.toString();
        const numericPackageId = parseInt(packageIdString, 10);

        // Log key information about the gig
        console.log("Gig debugging info:", {
          packageId,
          packageIdString,
          numericPackageId,
          creatorAddress: gigData.creatorAddress,
          hasSubgraphUrl: !!SUBGRAPH_URL,
        });

        // Check if subgraph URL is configured
        if (!SUBGRAPH_URL) {
          console.error("Subgraph URL is not configured.");
          // Continue without invitation data
        } else {
          // Implement retry logic for subgraph indexing delay
          const maxRetries = 3;
          let retryCount = 0;
          let success = false;

          while (retryCount < maxRetries && !success) {
            try {
              console.log(
                `Attempt ${retryCount + 1} to fetch invitation data for package ${packageId}`
              );

              // Add a slight delay between retries to allow for indexing
              if (retryCount > 0) {
                await new Promise((resolve) =>
                  setTimeout(resolve, 1500 * retryCount)
                );
              }

              // Try different potential ID formats
              const alternativeIdFormats = [
                packageIdString,
                numericPackageId.toString(),
                `0x${numericPackageId.toString(16)}`, // Hex format
                `0x${numericPackageId.toString(16).padStart(64, "0")}`, // Padded hex
              ];

              console.log("Trying these ID formats:", alternativeIdFormats);

              // Collect all invitations from the three approaches
              const allInvitations: Array<{
                id: string;
                status: string;
                invitedAt: string;
                respondedAt: string | null;
                ghostwriter: { id: string };
                transactionHash: string;
              }> = [];

              // First, try our standard query with multiple package ID formats
              const invitationsResponse =
                await graphqlRequest<IPackageInvitationsResponse>(
                  SUBGRAPH_URL,
                  GET_PACKAGE_INVITATIONS,
                  {
                    packageId: packageIdString,
                    numericPackageId: numericPackageId,
                  },
                  headers
                );

              // Try all invitation sources
              console.log("Raw invitation sources:", {
                packageByIdInvitations:
                  invitationsResponse.packageById?.invitations,
                packagesByNumber: invitationsResponse.packagesByNumber?.map(
                  (p) => ({
                    id: p.id,
                    packageId: p.packageId,
                    invitationsCount: p.invitations?.length || 0,
                  })
                ),
                directInvitationsCount:
                  invitationsResponse.invitationsByPackage?.length || 0,
              });

              // 1. From packageById
              if (invitationsResponse.packageById?.invitations) {
                allInvitations.push(
                  ...invitationsResponse.packageById.invitations
                );
              }

              // 2. From packagesByNumber
              if (invitationsResponse.packagesByNumber?.length > 0) {
                for (const pkg of invitationsResponse.packagesByNumber) {
                  if (pkg.invitations && pkg.invitations.length > 0) {
                    allInvitations.push(...pkg.invitations);
                  }
                }
              }

              // 3. From direct invitations query
              if (invitationsResponse.invitationsByPackage?.length > 0) {
                const directInvitations =
                  invitationsResponse.invitationsByPackage.map((inv) => ({
                    id: inv.id,
                    status: inv.status,
                    invitedAt: inv.invitedAt,
                    respondedAt: inv.respondedAt,
                    ghostwriter: inv.ghostwriter,
                    transactionHash: inv.transactionHash,
                  }));
                allInvitations.push(...directInvitations);
              }

              // If that failed, try each alternative ID format in separate queries
              if (allInvitations.length === 0) {
                console.log(
                  "No invitations found with standard query, trying alternative ID formats..."
                );

                for (const altId of alternativeIdFormats) {
                  if (altId === packageIdString) continue; // Skip the one we already tried

                  try {
                    console.log(`Trying alternative ID format: ${altId}`);

                    // Try the direct invitations query format
                    const altResponse =
                      await graphqlRequest<IPackageInvitationsResponse>(
                        SUBGRAPH_URL,
                        GET_PACKAGE_INVITATIONS,
                        {
                          packageId: altId,
                          numericPackageId: numericPackageId,
                        },
                        headers
                      );

                    // Log results for this format
                    console.log(`Results for ID format ${altId}:`, {
                      hasPackageById: !!altResponse.packageById,
                      packagesByNumberCount:
                        altResponse.packagesByNumber?.length || 0,
                      invitationsByPackageCount:
                        altResponse.invitationsByPackage?.length || 0,
                    });

                    // Collect invitations from this format
                    if (altResponse.packageById?.invitations) {
                      allInvitations.push(
                        ...altResponse.packageById.invitations
                      );
                    }

                    if (altResponse.packagesByNumber?.length > 0) {
                      for (const pkg of altResponse.packagesByNumber) {
                        if (pkg.invitations && pkg.invitations.length > 0) {
                          allInvitations.push(...pkg.invitations);
                        }
                      }
                    }

                    if (altResponse.invitationsByPackage?.length > 0) {
                      const directInvitations =
                        altResponse.invitationsByPackage.map((inv) => ({
                          id: inv.id,
                          status: inv.status,
                          invitedAt: inv.invitedAt,
                          respondedAt: inv.respondedAt,
                          ghostwriter: inv.ghostwriter,
                          transactionHash: inv.transactionHash,
                        }));
                      allInvitations.push(...directInvitations);
                    }

                    // If we found invitations, we can stop trying
                    if (allInvitations.length > 0) {
                      console.log(`Found invitations using format: ${altId}`);
                      break;
                    }
                  } catch (altError) {
                    console.error(
                      `Error with alternative ID format ${altId}:`,
                      altError
                    );
                  }
                }
              }

              // Process invitations if we found any
              if (allInvitations.length > 0) {
                // Function to transform each invitation to match our schema
                const transformInvitation = (invitation: {
                  id: string;
                  status: string;
                  invitedAt: string;
                  respondedAt: string | null;
                  ghostwriter: { id: string };
                  transactionHash: string;
                }) => {
                  // Just use the address from the invitation
                  const ghostwriterAddress = invitation.ghostwriter.id;

                  // Create a minimal ghostwriter reference with just the address
                  const ghostwriterRef = {
                    address: ghostwriterAddress,
                  };

                  return {
                    id: invitation.id,
                    status: invitation.status as EInvitationStatus,
                    invitedAt: invitation.invitedAt,
                    respondedAt: invitation.respondedAt,
                    ghostwriter: ghostwriterRef,
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

                invitationData = {
                  allInvited,
                  accepted,
                  declined,
                };

                success = true;
              } else {
                console.log(
                  `No invitations found for package ${packageId} on attempt ${retryCount + 1}`
                );
                retryCount++;
              }
            } catch (retryError) {
              console.error(`Error on attempt ${retryCount + 1}:`, retryError);
              retryCount++;

              if (retryCount >= maxRetries) {
                throw retryError; // Re-throw the last error if we've exhausted retries
              }
            }
          }
        }
      } catch (error) {
        // Log error but don't fail the entire request
        console.error("Error fetching invitation data:", error);
        // Return an empty invitations object instead of null
        invitationData = { allInvited: [], accepted: [], declined: [] };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: gigId,
        ...gigData,
        invitations: invitationData,
        isInvitedGhostwriter,
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
  { params }: { params: Promise<{ id: string }> }
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
    const { id: gigId } = await params;
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
