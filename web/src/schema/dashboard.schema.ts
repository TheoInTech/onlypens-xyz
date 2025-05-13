import { z } from "zod";
import { ActivityLogSchema } from "./activity-log.schema";
import { ERoles } from "@/stores/constants";

// Base dashboard data shared between roles
const BaseDashboardSchema = z.object({
  walletAddress: z.string(),
  role: z.nativeEnum(ERoles),
  recentActivity: z.array(ActivityLogSchema),
});

// Creator-specific dashboard data
const CreatorDashboardSchema = BaseDashboardSchema.extend({
  totalGigsCreated: z.number(),
  totalAmountSpent: z.string(), // USDC amount in smallest units
  totalEscrowedAmount: z.string(), // USDC amount in smallest units
  draftsWaitingForApproval: z.number(),
});

// Ghostwriter-specific dashboard data
const GhostwriterDashboardSchema = BaseDashboardSchema.extend({
  totalActiveInvites: z.number(),
  totalActiveProjects: z.number(),
  totalEarnings: z.string(), // USDC amount in smallest units
  draftsInProgress: z.number(),
});

// Combined dashboard schema that can be either creator or ghostwriter
export const DashboardSchema = z.discriminatedUnion("role", [
  CreatorDashboardSchema.extend({ role: z.literal(ERoles.CREATOR) }),
  GhostwriterDashboardSchema.extend({ role: z.literal(ERoles.GHOSTWRITER) }),
]);

export type IDashboard = z.infer<typeof DashboardSchema>;

// API response schema
export const DashboardResponseSchema = z.object({
  success: z.boolean(),
  data: DashboardSchema.nullable(),
  error: z.string().nullable(),
});

export type IDashboardResponse = z.infer<typeof DashboardResponseSchema>;
