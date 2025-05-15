import { z } from "zod";
import {
  EContentTypes,
  ENicheKeywords,
  EToneKeywords,
} from "@/schema/enum.schema";

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

export type IMatchmakerResponse = z.infer<typeof MatchmakerResponseSchema>;
