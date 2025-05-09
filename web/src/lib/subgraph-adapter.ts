import {
  GigStatus as PackageStatus,
  IOnchainGig,
  IGigMetadata,
} from "@/schema/gig.schema";
import {
  PackageStatus as SubgraphPackageStatus,
  IGigPackage as ISubgraphGigPackage,
  IActivityEvent,
} from "@/schema/subgraph.schema";
import { EActivityType } from "@/schema/enum.schema";

/**
 * Maps contract/subgraph status values to application GigStatus values
 */
export function mapStatusFromSubgraph(status: number): PackageStatus {
  // Map from contract PackageStatus to application GigStatus
  switch (status) {
    case SubgraphPackageStatus.PENDING:
      return PackageStatus.PENDING;
    case SubgraphPackageStatus.INVITED:
      return PackageStatus.INVITED;
    case SubgraphPackageStatus.ASSIGNED:
      return PackageStatus.ASSIGNED;
    case SubgraphPackageStatus.IN_PROGRESS:
      return PackageStatus.IN_PROGRESS;
    case SubgraphPackageStatus.COMPLETED:
      return PackageStatus.COMPLETED;
    case SubgraphPackageStatus.CANCELLED:
      return PackageStatus.CANCELLED;
    default:
      return PackageStatus.PENDING;
  }
}

/**
 * Converts subgraph GigPackage data to application OnchainGig format
 */
export function convertSubgraphToOnchainGig(
  subgraphData: ISubgraphGigPackage
): IOnchainGig {
  return {
    gigId: subgraphData.id,
    creator: subgraphData.creator,
    writer: subgraphData.writer || null,
    amount: subgraphData.totalAmount,
    status: mapStatusFromSubgraph(parseInt(subgraphData.status.toString())),
    createdAt: parseInt(subgraphData.createdAt.toString()),
    lastUpdated: parseInt(subgraphData.lastUpdated.toString()),
    expiresAt: subgraphData.expiresAt
      ? parseInt(subgraphData.expiresAt.toString())
      : null,
    numDeliverables: subgraphData.numDeliverables,
    numApproved: subgraphData.numApproved,
    amountReleased: subgraphData.amountReleased,
  };
}

/**
 * Maps event types from subgraph to application activity types
 */
export function mapEventTypeToActivityType(eventType: string): EActivityType {
  switch (eventType) {
    case "GIG_CREATED":
      return EActivityType.GIG_CREATED;
    case "INVITE_SENT":
      return EActivityType.INVITE_SENT;
    case "INVITE_ACCEPTED":
      return EActivityType.INVITE_ACCEPTED;
    case "INVITE_DECLINED":
      return EActivityType.INVITE_DECLINED;
    case "DRAFT_SUBMITTED":
      return EActivityType.DRAFT_SUBMITTED;
    case "DRAFT_REVISED":
      return EActivityType.DRAFT_REVISED;
    case "DRAFT_APPROVED":
      return EActivityType.DRAFT_APPROVED;
    case "DRAFT_REJECTED":
      return EActivityType.DRAFT_REJECTED;
    case "PAYMENT_RELEASED":
      return EActivityType.PAYMENT_RELEASED;
    case "GIG_EXPIRED":
      return EActivityType.GIG_EXPIRED;
    case "GIG_CANCELLED":
      return EActivityType.GIG_CANCELLED;
    case "GIG_COMPLETED":
      return EActivityType.GIG_COMPLETED;
    default:
      return EActivityType.GIG_CREATED;
  }
}

/**
 * Creates activity log entries from subgraph activity events
 */
export function createActivityLogsFromEvents(events: IActivityEvent[]): {
  event: EActivityType;
  timestamp: number;
  by: string | null;
  details?: Record<string, string> | null;
}[] {
  return events.map((event) => {
    const activityType = mapEventTypeToActivityType(event.eventType);

    // Determine who performed the action
    let by: string | null = null;
    if (event.creator) {
      by = event.creator;
    } else if (event.writer) {
      by = event.writer;
    }

    // Create details object for additional context
    const details: Record<string, string> = {};

    if (event.deliverable) {
      details.deliverableId = event.deliverable.deliverableId;
      details.contentType = event.deliverable.contentType;
    }

    if (event.amount) {
      details.amount = event.amount;
    }

    return {
      event: activityType,
      timestamp: parseInt(event.timestamp.toString()),
      by,
      details: Object.keys(details).length > 0 ? details : null,
    };
  });
}

/**
 * Formats and prepares gig data for UI display
 */
export function formatGigDataForUI(
  onchainGig: IOnchainGig,
  metadata: IGigMetadata,
  activities: {
    event: EActivityType;
    timestamp: number;
    by: string | null;
    details?: Record<string, string> | null;
  }[]
) {
  // Merge the data
  return {
    onchainGig,
    metadata: {
      ...metadata,
      // Update metadata history with blockchain events if needed
      history: activities.length > 0 ? activities : metadata.history,
    },
    event:
      activities.length > 0 ? activities[0].event : EActivityType.GIG_CREATED,
  };
}

/**
 * Converts wei/smallest unit amounts to whole token values (e.g., USDC)
 */
export function formatTokenAmount(amount: string): string {
  return (parseInt(amount) / 1_000_000).toFixed(2); // USDC has 6 decimals
}

/**
 * Formats a timestamp to human-readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}
