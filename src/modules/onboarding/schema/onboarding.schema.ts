import { z } from "zod";

// Step 1: Company Profile Schema
export const companyProfileSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  logoUrl: z.string().url().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  // Billing
  billingName: z.string().optional().or(z.literal("")),
  billingDocument: z.string().optional().or(z.literal("")),
  billingDocumentType: z.enum(["nit", "cc", "ce"]),
  billingAddress: z.string().optional().or(z.literal("")),
  billingEmail: z.string().email().optional().or(z.literal("")),
  billingPhone: z.string().optional().or(z.literal("")),
});

export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

// Step 2: Branch Schema
export const branchSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  name: z.string().min(1, "Branch name is required"),
  slug: z.string().min(1, "Branch slug is required").optional(),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  isMain: z.boolean(),
});

export type BranchInput = z.infer<typeof branchSchema>;

export const updateBranchSchema = branchSchema.omit({ companyId: true }).partial();
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

// Step 3: Invite Team Schema
export const inviteSchema = z.object({
  companyId: z.string().uuid("Invalid company ID"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "seller", "viewer"]),
});

export type InviteInput = z.infer<typeof inviteSchema>;

// Step 4: Complete Onboarding Schema
export const completeOnboardingSchema = z.object({
  skip: z.boolean(),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

// Onboarding Progress Schema
export const onboardingProgressSchema = z.object({
  step: z.number().min(1).max(4).default(1),
  completedSteps: z.array(z.number()).default([]),
});

export type OnboardingProgress = z.infer<typeof onboardingProgressSchema>;
