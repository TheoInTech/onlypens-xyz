import { z } from "zod";
import { EActivityType } from "@/schema/enum.schema";

export const ActivityLogSchema = z.object({
  id: z.string(),
  activity: z
    .nativeEnum(EActivityType)
    .describe("Short description (e.g., 'Draft submitted', 'Invite accepted')"),
  title: z.string().describe("Linkable title or short summary"),
  createdAt: z
    .string()
    .describe("ISO timestamp used to calculate relative time"),
});

export type IActivityLog = z.infer<typeof ActivityLogSchema>;

export const mockActivityLogs: IActivityLog[] = [
  {
    id: "1",
    activity: EActivityType.GIG_CREATED,
    title: "Logo Design for Tech Startup",
    createdAt: "2023-06-10T12:30:00Z",
  },
  {
    id: "2",
    activity: EActivityType.INVITE_SENT,
    title: "Website Redesign Project",
    createdAt: "2023-06-10T10:15:00Z",
  },
  {
    id: "3",
    activity: EActivityType.INVITE_ACCEPTED,
    title: "Social Media Graphics Pack",
    createdAt: "2023-06-09T15:45:00Z",
  },
  {
    id: "4",
    activity: EActivityType.DRAFT_SUBMITTED,
    title: "Product Illustration Set",
    createdAt: "2023-06-08T09:20:00Z",
  },
  {
    id: "5",
    activity: EActivityType.DRAFT_APPROVED,
    title: "Brand Identity Guidelines",
    createdAt: "2023-06-07T14:10:00Z",
  },
  {
    id: "6",
    activity: EActivityType.DRAFT_REJECTED,
    title: "Marketing Brochure Design",
    createdAt: "2023-06-05T11:30:00Z",
  },
  {
    id: "7",
    activity: EActivityType.DRAFT_REVISED,
    title: "App UI Components",
    createdAt: "2023-06-03T16:25:00Z",
  },
  {
    id: "8",
    activity: EActivityType.PAYMENT_RELEASED,
    title: "Corporate Stationery Design",
    createdAt: "2023-05-27T08:40:00Z",
  },
  {
    id: "9",
    activity: EActivityType.INVITE_DECLINED,
    title: "eBook Cover Design",
    createdAt: "2023-05-20T13:50:00Z",
  },
  {
    id: "10",
    activity: EActivityType.GIG_EXPIRED,
    title: "Vector Illustration Series",
    createdAt: "2023-05-10T10:05:00Z",
  },
];
