import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db as clientDb } from "@/lib/firebase-client"; // For GET requests
import { doc as clientDoc, getDoc as clientGetDoc } from "firebase/firestore"; // For GET requests
import { request as graphqlRequest } from "graphql-request";
import { ERoles } from "@/stores/constants";
import {
  GET_USER,
  GET_CREATOR_ALL_GIGS,
  GET_CREATOR_ALL_DELIVERABLES,
  GET_GHOSTWRITER_INVITATIONS,
  GET_GHOSTWRITER_ACCEPTED_INVITATIONS,
  GET_GHOSTWRITER_SUBMITTED_DRAFTS,
} from "@/graphql";
import { DashboardResponseSchema, IDashboard } from "@/schema/dashboard.schema";
import { IActivityLog } from "@/schema/activity-log.schema";
import { EActivityType } from "@/schema/enum.schema";
import {
  IUserResponse,
  IGig,
  IGigsResponse,
  IDeliverableResponse,
  IDeliverablesResponse,
  IInvitation,
  IInvitationsResponse,
  IPackageWithDeliverables,
  IPackagesWithDeliverablesResponse,
} from "@/schema/subgraph.schema";

// Subgraph URL and headers configuration
const SUBGRAPH_URL = process.env.SUBGRAPH_URL!;
const GRAPH_API_KEY = process.env.THE_GRAPH_API_KEY!;

// Headers for authorization if API key is available
const headers = { Authorization: `Bearer ${GRAPH_API_KEY}` };

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
        },
        { status: 401 }
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

    const walletAddress = token.sub;
    const userRef = clientDoc(clientDb, "users", walletAddress);
    const userDoc = await clientGetDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({
        success: false,
        data: null,
        error: "User not found.",
      });
    }

    const userData = userDoc.data();
    const role = userData.role;

    // Get common user data from subgraph using direct request
    const userResponse = await graphqlRequest<IUserResponse>(
      SUBGRAPH_URL,
      GET_USER,
      { id: walletAddress },
      headers
    );

    // Initialize dashboard data based on user role
    let dashboardData: IDashboard;

    if (role === ERoles.CREATOR) {
      // Fetch creator-specific data using direct request
      const [gigsResponse, allDeliverablesResponse] = await Promise.all([
        graphqlRequest<IGigsResponse>(
          SUBGRAPH_URL,
          GET_CREATOR_ALL_GIGS,
          { creatorId: walletAddress, first: 1000 },
          headers
        ),
        graphqlRequest<IPackagesWithDeliverablesResponse>(
          SUBGRAPH_URL,
          GET_CREATOR_ALL_DELIVERABLES,
          {
            creatorId: walletAddress,
            first: 100,
          },
          headers
        ),
      ]);

      // Calculate creator metrics
      const gigs = gigsResponse.packages || [];
      const totalGigsCreated = gigs.length;

      // Calculate total spent (from user data) and escrowed amount (from active gigs)
      const totalAmountSpent = userResponse.user?.totalPaymentsSent || "0";

      // Calculate escrowed amount (total amount minus released amount across all gigs)
      let totalEscrowedAmount = "0";
      if (gigs.length > 0) {
        totalEscrowedAmount = gigs
          .reduce((total: bigint, gig: IGig) => {
            const gigTotal = BigInt(gig.totalAmount);
            const released = BigInt(gig.amountReleased || "0");
            return total + (gigTotal - released);
          }, BigInt(0))
          .toString();
      }

      // Count drafts waiting for approval by flattening deliverables from all packages
      const submittedDrafts =
        allDeliverablesResponse.packages
          ?.flatMap((pkg: IPackageWithDeliverables) => pkg.deliverables || [])
          .filter(
            (draft: IDeliverableResponse) => draft.status === "SUBMITTED"
          ) || [];

      const draftsWaitingForApproval = submittedDrafts.length;

      // Collect recent activity logs
      const recentActivity = createActivityLogs(gigs);

      dashboardData = {
        walletAddress,
        role: ERoles.CREATOR,
        totalGigsCreated,
        totalAmountSpent,
        totalEscrowedAmount,
        draftsWaitingForApproval,
        recentActivity,
      };
    } else if (role === ERoles.GHOSTWRITER) {
      // Fetch ghostwriter-specific data using direct request
      const [invitationsResponse, acceptedInvitationsResponse, draftsResponse] =
        await Promise.all([
          graphqlRequest<IInvitationsResponse>(
            SUBGRAPH_URL,
            GET_GHOSTWRITER_INVITATIONS,
            { ghostwriterId: walletAddress, first: 100 },
            headers
          ),
          graphqlRequest<IInvitationsResponse>(
            SUBGRAPH_URL,
            GET_GHOSTWRITER_ACCEPTED_INVITATIONS,
            { ghostwriterId: walletAddress, first: 100 },
            headers
          ),
          graphqlRequest<IDeliverablesResponse>(
            SUBGRAPH_URL,
            GET_GHOSTWRITER_SUBMITTED_DRAFTS,
            { ghostwriterId: walletAddress, first: 100 },
            headers
          ),
        ]);

      // Calculate ghostwriter metrics
      const invitations = invitationsResponse.invitations || [];
      const acceptedInvitations = acceptedInvitationsResponse.invitations || [];
      const drafts = draftsResponse.deliverables || [];

      const totalActiveInvites = invitations.filter(
        (invite: IInvitation) => invite.status === "PENDING"
      ).length;

      const totalActiveProjects = acceptedInvitations.filter(
        (invite: IInvitation) =>
          ["ASSIGNED", "IN_PROGRESS"].includes(invite.package?.status || "")
      ).length;

      const totalEarnings = userResponse.user?.totalPaymentsReceived || "0";
      const draftsInProgress = drafts.length;

      // Collect recent activity logs
      const recentActivity = createActivityLogsForGhostwriter(
        invitations,
        drafts
      );

      dashboardData = {
        walletAddress,
        role: ERoles.GHOSTWRITER,
        totalActiveInvites,
        totalActiveProjects,
        totalEarnings,
        draftsInProgress,
        recentActivity,
      };
    } else {
      // Unknown role
      return NextResponse.json({
        success: false,
        data: null,
        error: "Invalid user role.",
      });
    }

    // Validate and return the response
    const validatedResponse = DashboardResponseSchema.parse({
      success: true,
      data: dashboardData,
      error: null,
    });

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Failed to fetch dashboard data.",
      },
      { status: 500 }
    );
  }
}

// Helper function to create activity logs for creators
function createActivityLogs(gigs: IGig[]): IActivityLog[] {
  const logs: IActivityLog[] = [];

  // Process gigs to create activity logs
  for (const gig of gigs) {
    // Add gig creation activity
    logs.push({
      id: `gig-created-${gig.id}`,
      activity: EActivityType.GIG_CREATED,
      title: `Gig #${gig.packageId} created`,
      createdAt: new Date(gig.createdAt * 1000).toISOString(),
    });

    // Add other activities based on gig status
    if (gig.status === "COMPLETED") {
      logs.push({
        id: `gig-completed-${gig.id}`,
        activity: EActivityType.GIG_COMPLETED,
        title: `Gig #${gig.packageId} completed`,
        createdAt: new Date(gig.lastUpdated * 1000).toISOString(),
      });
    }
  }

  // Sort by most recent and limit to 10
  return logs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);
}

// Helper function to create activity logs for ghostwriters
function createActivityLogsForGhostwriter(
  invitations: IInvitation[],
  drafts: IDeliverableResponse[]
): IActivityLog[] {
  const logs: IActivityLog[] = [];

  // Process invitations
  for (const invite of invitations) {
    logs.push({
      id: `invite-${invite.id}`,
      activity:
        invite.status === "PENDING"
          ? EActivityType.INVITE_SENT
          : invite.status === "ACCEPTED"
            ? EActivityType.INVITE_ACCEPTED
            : EActivityType.INVITE_DECLINED,
      title: `Invitation for gig #${invite.package?.packageId}`,
      createdAt: new Date(invite.invitedAt * 1000).toISOString(),
    });
  }

  // Process drafts
  for (const draft of drafts) {
    logs.push({
      id: `draft-${draft.id}`,
      activity: EActivityType.DRAFT_SUBMITTED,
      title: `Draft #${draft.deliverableId} submitted`,
      createdAt: new Date(draft.submittedAt * 1000).toISOString(),
    });
  }

  // Sort by most recent and limit to 10
  return logs
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 10);
}
