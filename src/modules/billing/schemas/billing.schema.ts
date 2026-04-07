import { z } from "zod";

export const billingConfigSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  paymentMethods: z
    .object({
      cash: z.boolean(),
      transfer: z.boolean(),
      card: z.boolean(),
    })
    .optional(),
  taxName: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxDefault: z.boolean().optional(),
  invoicePrefix: z.string().optional(),
  invoiceSeries: z.string().optional(),
  invoiceAutoNumber: z.boolean().optional(),
  currency: z.string().length(3).optional(),
  currencySymbol: z.string().max(5).optional(),
  defaultNotes: z.string().optional(),
});

export type BillingConfigInput = z.infer<typeof billingConfigSchema>;

export const switchPlanSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  planId: z.string().uuid("Invalid plan ID"),
});

export type SwitchPlanInput = z.infer<typeof switchPlanSchema>;
