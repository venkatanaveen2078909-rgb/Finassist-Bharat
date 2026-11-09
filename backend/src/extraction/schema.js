import { z } from "zod";

export const FinancialIntentEnum = z.enum([
  "budget_analysis",
  "loan_emi",
  "loan_eligibility",
  "investment_sip",
  "investment_fd",
  "profile_update",
  "profile_query",
  "profile_reset",
  "greeting",
  "unknown",
]);

export const ExtractionParamsSchema = z.object({
  amount: z.number().nullable().optional(),
  rate: z.number().nullable().optional(),
  tenureYears: z.number().nullable().optional(),
  tenureMonths: z.number().nullable().optional(),
  expenses: z.number().nullable().optional(),
  obligations: z.number().nullable().optional(),
  goal: z.string().nullable().optional(),
});

export const ExtractionResultSchema = z.object({
  intent: FinancialIntentEnum,
  params: ExtractionParamsSchema,
  confidence: z.number().min(0).max(1),
  needs_clarification: z.boolean(),
  clarification_question: z.string().nullable().optional(),
});
