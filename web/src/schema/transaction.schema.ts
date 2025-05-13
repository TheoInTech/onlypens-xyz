import { z } from "zod";

export const TransactionErrorSchema = z
  .object({
    hash: z.string(),
    status: z.string(),
    message: z.string().optional(),
    code: z.union([z.string(), z.number()]).optional(),
    reason: z.string().optional(),
  })
  .catchall(z.unknown());

export type ITransactionError = z.infer<typeof TransactionErrorSchema>;
