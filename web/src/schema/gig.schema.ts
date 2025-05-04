import { z } from "zod";
import {
  EContentTypes,
  ENicheKeywords,
  ESubmissionStatus,
  EToneKeywords,
} from "@/schema/enum.schema";

// Define the GigStatus enum to match the Solidity contract
export enum GigStatus {
  PENDING = 0,
  INVITED = 1,
  ASSIGNED = 2,
  SUBMITTED = 3,
  APPROVED = 4,
  REJECTED = 5,
  AUTO_RELEASED = 6,
}

// Schema for onchain gig data as returned from the smart contract
export const OnchainGigSchema = z.object({
  gigId: z.string(),
  creator: z.string(), // ethereum address
  writer: z.string().optional(), // ethereum address, optional for pending gigs
  amount: z.string(), // USDC amount in smallest units; string to avoid JS’s safe integer range
  status: z.nativeEnum(GigStatus),
  createdAt: z.number(), // unix timestamp
  lastUpdated: z.number(), // unix timestamp
});

export type IOnchainGig = z.infer<typeof OnchainGigSchema>;

// Schema for offchain gig metadata stored in Firebase
export const GigMetadataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  contentType: z.nativeEnum(EContentTypes),
  toneKeywords: z.array(z.nativeEnum(EToneKeywords)),
  nicheKeywords: z.array(z.nativeEnum(ENicheKeywords)),
  wordCount: z.number().optional(),
  deadline: z.number().optional(), // unix timestamp
  invitedGhostwriters: z.array(z.string()).optional(),
  submissions: z
    .array(
      z.object({
        submissionId: z.string(),
        submittedBy: z.string(),
        previewLink: z.string(),
        status: z.nativeEnum(ESubmissionStatus),
        submittedAt: z.string(),
        feedback: z.string().optional(),
      })
    )
    .optional(),
  history: z
    .array(
      z.object({
        event: z.string(),
        timestamp: z.number(),
        by: z.string().optional(),
        details: z.record(z.string()).optional(),
      })
    )
    .optional(),
});

export type IGigMetadata = z.infer<typeof GigMetadataSchema>;
