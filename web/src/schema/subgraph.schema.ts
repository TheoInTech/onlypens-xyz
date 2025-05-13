import { z } from "zod";
import { EActivityType } from "@/schema/enum.schema";

// Matching PackageStatus from the smart contract
export enum PackageStatus {
  PENDING = 0,
  INVITED = 1,
  ASSIGNED = 2,
  IN_PROGRESS = 3,
  COMPLETED = 4,
  CANCELLED = 5,
}

// Matching DeliverableStatus from the smart contract
export enum DeliverableStatus {
  PENDING = 0,
  SUBMITTED = 1,
  APPROVED = 2,
  REJECTED = 3,
}

// Schema for GigPackage entity from subgraph
export const GigPackageSchema = z.object({
  id: z.string(), // packageId
  creator: z.string(), // creator address
  writer: z.string().nullable(), // writer address or null if not assigned
  totalAmount: z.string(), // totalAmount in smallest units of USDC
  createdAt: z.number(), // Unix timestamp
  lastUpdated: z.number(), // Unix timestamp
  expiresAt: z.number().nullable(), // Optional expiry timestamp
  status: z.nativeEnum(PackageStatus),
  numDeliverables: z.number(),
  numApproved: z.number(),
  amountReleased: z.string(), // Amount released in smallest units of USDC
  deliverables: z.array(z.string()), // Array of deliverable IDs
  invitees: z.array(z.string()).nullable(), // Array of invitee addresses
});

export type IGigPackage = z.infer<typeof GigPackageSchema>;

// Schema for Deliverable entity from subgraph
export const DeliverableSchema = z.object({
  id: z.string(), // deliverableId
  packageId: z.string(), // packageId it belongs to
  contentType: z.string(),
  status: z.nativeEnum(DeliverableStatus),
  amount: z.string(), // Amount in smallest units of USDC
  submittedAt: z.number().nullable(), // Optional submission timestamp
  approvedAt: z.number().nullable(), // Optional approval timestamp
  createdAt: z.number(), // Creation timestamp
});

export type IDeliverable = z.infer<typeof DeliverableSchema>;

// Schema for GhostwriterInvitation entity from subgraph
export const GhostwriterInvitationSchema = z.object({
  id: z.string(), // Composite ID: packageId-ghostwriterAddress
  packageId: z.string(), // packageId
  ghostwriter: z.string(), // Ghostwriter address
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED", "REMOVED"]),
  invitedAt: z.number(), // Invitation timestamp
  respondedAt: z.number().nullable(), // Optional response timestamp
});

export type IGhostwriterInvitation = z.infer<
  typeof GhostwriterInvitationSchema
>;

// Define a nested deliverable reference schema as used in the subgraph
export const DeliverableReferenceSchema = z.object({
  id: z.string(),
  deliverableId: z.string(),
  contentType: z.string(),
});

// Schema for ActivityEvent entity from subgraph
export const ActivityEventSchema = z.object({
  id: z.string(), // Event transaction hash + log index
  packageId: z.string(), // packageId
  eventType: z.nativeEnum(EActivityType),
  creator: z.string().nullable(), // Creator address if relevant
  writer: z.string().nullable(), // Writer address if relevant
  deliverable: DeliverableReferenceSchema.nullable(), // Reference to a deliverable
  amount: z.string().nullable(), // Amount if relevant
  timestamp: z.number(), // Event timestamp
  transactionHash: z.string(), // Transaction hash
});

export type IActivityEvent = z.infer<typeof ActivityEventSchema>;

// Schema for User entity from subgraph
export const UserStatsSchema = z.object({
  id: z.string(), // User address
  createdPackages: z.array(z.string()), // Array of created package IDs
  assignedPackages: z.array(z.string()), // Array of assigned package IDs
  invitedToPackages: z.array(z.string()), // Array of packages user was invited to
  totalCreated: z.number(), // Total number of packages created
  totalAssigned: z.number(), // Total number of packages assigned
  totalEarned: z.string(), // Total amount earned in smallest units of USDC
  totalSpent: z.string(), // Total amount spent in smallest units of USDC
});

export type IUserStats = z.infer<typeof UserStatsSchema>;

// Schema for payment events
export const PaymentEventSchema = z.object({
  id: z.string(), // Event transaction hash + log index
  packageId: z.string(), // packageId
  deliverableId: z.string().nullable(), // deliverableId (null for batch payments)
  from: z.string(), // Creator address
  to: z.string(), // Writer address
  amount: z.string(), // Amount in smallest units of USDC
  timestamp: z.number(), // Event timestamp
  transactionHash: z.string(), // Transaction hash
});

export type IPaymentEvent = z.infer<typeof PaymentEventSchema>;

// ======== GraphQL Response Types ========

// User response types
export interface IUser {
  id: string;
  totalPaymentsReceived?: string;
  totalPaymentsSent?: string;
}

export interface IUserResponse {
  user: IUser | null;
}

// Gig response types
export interface IGig {
  id: string;
  packageId: string;
  totalAmount: string;
  amountReleased: string;
  status: string;
  createdAt: number;
  lastUpdated: number;
  expiresAt: number;
  isExpired: boolean;
  writer: { id: string } | null;
  numDeliverables: number;
  numApproved: number;
  transactionHash: string;
}

export interface IGigsResponse {
  packages: IGig[];
}

// Deliverable response types
export interface IDeliverableResponse {
  id: string;
  deliverableId: string;
  contentType: string;
  status: string;
  amount: string;
  submittedAt: number;
  approvedAt?: number;
  rejectedAt?: number;
  revisedAt?: number;
  writer?: { id: string };
  package?: {
    id: string;
    packageId: string;
    status: string;
    creator: { id: string };
  };
  transactionHash: string;
}

export interface IDeliverablesResponse {
  deliverables: IDeliverableResponse[];
}

// Invitation response types
export interface IInvitation {
  id: string;
  status: string;
  invitedAt: number;
  respondedAt?: number;
  ghostwriter?: { id: string };
  package?: {
    id: string;
    packageId: string;
    status: string;
    creator: { id: string };
    totalAmount: string;
    expiresAt: number;
    isExpired: boolean;
    createdAt: number;
    transactionHash: string;
  };
  transactionHash: string;
}

export interface IInvitationsResponse {
  invitations: IInvitation[];
}

// Package with deliverables response type
export interface IPackageWithDeliverables {
  id: string;
  packageId: string;
  status: string;
  deliverables: IDeliverableResponse[];
}

export interface IPackagesWithDeliverablesResponse {
  packages: IPackageWithDeliverables[];
}
