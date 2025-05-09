import { z } from "zod";
import { ERoles } from "@/stores/constants";
import {
  EToneKeywords,
  ENicheKeywords,
  EContentTypes,
} from "@/schema/enum.schema";

// Flattened user schema
export const UserSchema = z
  .object({
    // Basic info
    address: z.string(), // Unique identifier for the user
    displayName: z
      .string()
      .min(1, "Display name is required")
      .max(50, "Display name should be less than 50 characters"),
    about: z
      .string()
      .min(10, "About me should be at least 10 characters")
      .max(500, "About me should be less than 500 characters"),
    avatarUrl: z.string().optional(),
    role: z.nativeEnum(ERoles),
    createdAt: z.number().int().optional(), // Unix timestamp
    updatedAt: z.number().int().optional(), // Unix timestamp

    // Samples
    samples: z
      .array(
        z
          .string()
          .max(2000, "Sample writing should be less than 2000 characters")
      )
      .min(3, "You must provide all 3 sample writings")
      .max(3, "You can provide up to 3 sample writings"),

    // Preferences
    toneKeywords: z
      .array(z.nativeEnum(EToneKeywords))
      .min(3, "You must select at least 3 tone keywords")
      .max(5, "You can select up to 5 tone keywords"),
    nicheKeywords: z
      .array(z.nativeEnum(ENicheKeywords))
      .min(1, "You must select at least 1 niche keyword")
      .max(10, "You can select up to 10 niche keywords"),

    // Ghostwriter-specific fields (conditional based on role)
    contentTypeKeywords: z.array(z.nativeEnum(EContentTypes)),
    ratePerWord: z.coerce.number().positive().nullable(),
  })
  .refine(
    (data) => {
      // Validate creator fields
      if (data.role === ERoles.CREATOR) {
        // Creator should not have ghostwriter-specific fields (e.g. ratePerWord, contentTypeKeywords)
        return (
          data.ratePerWord === null && data.contentTypeKeywords.length === 0
        );
      }

      //   If ghostwriter, ratePerWord can't be null
      if (data.role === ERoles.GHOSTWRITER) {
        return (
          data.ratePerWord !== null &&
          data.ratePerWord > 0 &&
          data.contentTypeKeywords.length > 0
        );
      }

      return false;
    },
    {
      message:
        "User fields must match the selected role (creator or ghostwriter)",
      path: ["role"],
    }
  );

// Type definition
export type IUser = z.infer<typeof UserSchema>;

export const DefaultCreatorForm: IUser = {
  role: ERoles.CREATOR,
  address: "",
  displayName: "",
  about: "",
  avatarUrl: "",
  samples: [],
  toneKeywords: [],
  nicheKeywords: [],
  contentTypeKeywords: [],
  ratePerWord: null,
};

export const DefaultGhostwriterForm: IUser = {
  role: ERoles.GHOSTWRITER,
  address: "",
  displayName: "",
  about: "",
  avatarUrl: "",
  samples: [],
  toneKeywords: [],
  nicheKeywords: [],
  contentTypeKeywords: [],
  ratePerWord: null,
};
