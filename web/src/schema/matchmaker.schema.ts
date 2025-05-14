import { z } from "zod";
import {
  EContentTypes,
  ENicheKeywords,
  EToneKeywords,
} from "@/schema/enum.schema";

export enum EMatchmakerSource {
  ONBOARDING = "onboarding",
  GIG_CREATION = "gig-creation",
}

export const MatchmakerSchema = z.object({
  bio: z.string(),
  samples: z.array(z.string()).max(3),
  nicheKeywords: z.array(z.nativeEnum(ENicheKeywords)),
  contentTypeKeywords: z.array(z.nativeEnum(EContentTypes)),
  budget: z.number().positive(),
  source: z.nativeEnum(EMatchmakerSource),
});

export const MatchmakerResponseSchema = z.object({
  topTone: z.array(z.nativeEnum(EToneKeywords)),
  topNiches: z.array(z.nativeEnum(ENicheKeywords)),
  complexityLevel: z.enum(["basic", "intermediate", "advanced"]),
  preferredContentTypes: z.array(z.nativeEnum(EContentTypes)),
  writingPersona: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  idealMatchDescription: z.string(),
  tags: z.array(z.string()),
});

export type IMatchmaker = z.infer<typeof MatchmakerSchema>;
export type IMatchmakerResponse = z.infer<typeof MatchmakerResponseSchema>;
