import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  documentId: z.string().min(5, "Document ID must be at least 5 characters"),
  documentType: z.enum(["cc", "ce", "ti", "rc", "pa"]).default("cc"),
  departmentId: z.number().int().positive("Department is required"),
  municipalityId: z.number().int().positive("Municipality is required"),
  referralCode: z.string().optional(),
  companyName: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Terms must be accepted",
  }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Invalid slug format")
    .optional(),
  billingName: z.string().optional(),
  billingDocument: z.string().optional(),
  billingDocumentType: z.enum(["nit", "cc", "ce"]).default("nit"),
  billingAddress: z.string().optional(),
  billingEmail: z.string().email().optional(),
  billingPhone: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySchema = createCompanySchema.partial();

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const createBranchSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  name: z.string().min(1, "Branch name is required"),
  slug: z.string().min(1, "Branch slug is required").optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isMain: z.boolean().default(false),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = createBranchSchema.omit({ companyId: true }).partial();

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

export const inviteUserSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "member", "seller", "viewer"]).default("member"),
  branchId: z.string().uuid().optional(),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  companyId: z.string().uuid("Invalid company ID"),
  role: z.enum(["owner", "admin", "member", "seller", "viewer"]),
  isActive: z.boolean().optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

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
