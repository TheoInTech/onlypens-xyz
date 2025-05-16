import { z } from "zod";
import { EContentTypes, ENicheKeywords } from "@/schema/enum.schema";
import { UserSchema } from "@/schema/user.schema";

export enum EMatchmakerSource {
  ONBOARDING = "onboarding",
  GIG_CREATION = "gig-creation",
}

export enum EInvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export const MatchmakerSchema = z.object({
  bio: z.string(),
  samples: z.array(z.string()).max(3),
  nicheKeywords: z.array(z.nativeEnum(ENicheKeywords)),
  contentTypeKeywords: z.array(z.nativeEnum(EContentTypes)),
  budget: z.number().positive(),
  source: z.nativeEnum(EMatchmakerSource),
});

export const MatchmakerMatchResponseSchema = z.object({
  data: z.object({
    gigId: z.string(),
    matchedGhostwriterAddresses: z.array(z.string()),
  }),
  success: z.boolean(),
  error: z.string().optional(),
});

// Schema for invitation data
export const InvitationSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(EInvitationStatus),
  invitedAt: z.string(),
  respondedAt: z.string().nullable().optional(),
  ghostwriter: z.union([
    UserSchema, // Full user object
    z.object({
      // OR just a simple address reference
      address: z.string(),
    }),
  ]),
  transactionHash: z.string(),
});

// Schema for the invited ghostwriters response
export const InvitedGhostwritersResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      allInvited: z.array(InvitationSchema),
      accepted: z.array(InvitationSchema),
      declined: z.array(InvitationSchema),
    })
    .nullable(),
  error: z.string().nullable(),
});

export type IMatchmaker = z.infer<typeof MatchmakerSchema>;
export type IMatchmakerMatchResponse = z.infer<
  typeof MatchmakerMatchResponseSchema
>;
export type IInvitation = z.infer<typeof InvitationSchema>;
export type IInvitedGhostwritersResponse = z.infer<
  typeof InvitedGhostwritersResponseSchema
>;

// Re-export the type from shared schema
export type { IMatchmakerResponse } from "@/schema/shared.schema";
