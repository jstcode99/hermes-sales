export {
  getCompanySubscription,
  getUserSubscription,
  getPlanInfo,
  canAccessRoute,
  hasFeature,
  checkLimit,
  getCompanyUsageStats,
  PLAN_LIMITS,
} from "./services/subscription.service";

// Re-export from companies for convenience
export {
  getCompanyById,
  getPlanById,
  getAllPlans,
  getDefaultPlan,
} from "@/modules/companies/services/company.service";

export type {
  SubscriptionWithPlan,
  PlanInfo,
  UsageStats,
  PlanLimit,
} from "./services/subscription.service";
