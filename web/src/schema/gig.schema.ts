import { z } from "zod";
import {
  EActivityType,
  EContentTypes,
  ENicheKeywords,
} from "@/schema/enum.schema";
import { MatchmakerResponseSchema } from "./matchmaker.schema";

// Define the GigStatus enum to match the smart contract's PackageStatus
export enum GigStatus {
  PENDING = 0,
  INVITED = 1,
  ASSIGNED = 2,
  IN_PROGRESS = 3, // Changed from SUBMITTED to IN_PROGRESS
  COMPLETED = 4, // Changed from APPROVED to COMPLETED
  CANCELLED = 5, // Changed from REJECTED to CANCELLED
  AUTO_RELEASED = 6,
}

export const GigStatusLabels = {
  [GigStatus.PENDING]: "Waiting for invites",
  [GigStatus.INVITED]: "Invited ghostwriter",
  [GigStatus.ASSIGNED]: "Assigned ghostwriter",
  [GigStatus.IN_PROGRESS]: "Work in progress", // Updated label
  [GigStatus.COMPLETED]: "Gig completed", // Updated label
  [GigStatus.CANCELLED]: "Gig cancelled", // Updated label
  [GigStatus.AUTO_RELEASED]: "Auto-released",
};

// Schema for onchain gig data as returned from the smart contract
export const OnchainGigSchema = z.object({
  gigId: z.string(),
  creator: z.string(), // base eth address
  writer: z.string().nullish(), // base eth address, optional for pending gigs
  amount: z.string(), // USDC amount in smallest units; string to avoid JS's safe integer range
  status: z.nativeEnum(GigStatus),
  createdAt: z.number(), // unix timestamp
  lastUpdated: z.number(), // unix timestamp
  expiresAt: z.number().nullish(), // Optional expiry timestamp
  numDeliverables: z.number().optional(), // Total number of deliverables
  numApproved: z.number().optional(), // Number of approved deliverables
  amountReleased: z.string().optional(), // Amount released so far
});

export type IOnchainGig = z.infer<typeof OnchainGigSchema>;

// Schema for deliverable item with clearer field naming
export const DeliverableSchema = z.object({
  contentType: z.nativeEnum(EContentTypes),
  price: z.string(), // Total price for all items of this content type
  quantity: z.string(), // Number of items
  requirements: z.string().optional(), // Optional specific requirements for this content type
});

// Schema for offchain gig metadata stored in Firebase
export const GigMetadataSchema = z.object({
  title: z.string(),
  description: z.string().nullish(),
  deliverables: z.array(DeliverableSchema).default([]),
  nicheKeywords: z.array(z.nativeEnum(ENicheKeywords)),
  deadline: z.number().nullish(), // unix timestamp
  referenceWritings: z.array(z.string()).nullish(),
  matchmaker: MatchmakerResponseSchema.nullish(),
});

export type IGigMetadata = z.infer<typeof GigMetadataSchema>;

export const GigSchema = z.object({
  onchainGig: OnchainGigSchema,
  metadata: GigMetadataSchema,
  event: z.nativeEnum(EActivityType),
});

export type IGig = z.infer<typeof GigSchema>;

export const MAX_TONE_KEYWORDS = 5;
export const MAX_NICHE_KEYWORDS = 3;

// Schema for gig creation form submission via API
export const GigFormSchema = z.object({
  packageId: z.number(),
  creatorAddress: z.string(),
  transactionHash: z.string(),
  totalAmount: z.string(), // USDC amount in smallest units
  expiresAt: z.number().nullable(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  nicheKeywords: z
    .array(z.nativeEnum(ENicheKeywords))
    .min(1, "Select at least one niche keyword")
    .max(3, "Select at most 3 niche keywords"),
  deadline: z.date().or(z.string()), // unix timestamp for off-chain deadline
  numberOfDeliverables: z.number().int().positive(),
  deliverables: z
    .array(DeliverableSchema)
    .min(1, "At least one deliverable is required"),
  referenceWritings: z.array(z.string()), // Optional reference writings
  matchmaker: MatchmakerResponseSchema.nullish(),
});

export type IGigForm = z.infer<typeof GigFormSchema>;
export type IDeliverable = z.infer<typeof DeliverableSchema>;
