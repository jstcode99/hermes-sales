"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding, type OnboardingStep } from "../hooks/use-onboarding";
import { OnboardingHeader } from "./onboarding-header";
import { OnboardingFooter } from "./onboarding-footer";
import { StepCompanyProfile } from "./step-company-profile";
import { StepBranches } from "./step-branches";
import { StepInviteTeam } from "./step-invite-team";
import { StepFinish } from "./step-finish";
import { getCompanyWithBilling, getCompanyBranches, getCompanyMembers, getPendingInvitations, getPlanLimits, getUserPrimaryCompany } from "../services/onboarding.service";

// Local type definitions (avoid dependency on database.types)
interface Branch {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  is_main: boolean;
}

interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  role: string;
  is_active: boolean;
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface Invitation {
  id: string;
  email: string;
  company_id: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

interface OnboardingWizardProps {
  userId: string;
}

export function OnboardingWizard({ userId }: OnboardingWizardProps) {
  const router = useRouter();
  const { state, nextStep, prevStep, setCompany, markStepCompleted, resetState } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [companyData, setCompanyData] = useState<any>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<CompanyUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [planLimits, setPlanLimits] = useState({ branchLimit: 1, userLimit: 5 });

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const companyInfo = await getUserPrimaryCompany(userId);
        if (!companyInfo) {
          throw new Error("No company found");
        }

        // Handle company being either array or object
        const companyObj = Array.isArray(companyInfo.company) 
          ? companyInfo.company[0] 
          : companyInfo.company;

        setCompany(companyInfo.companyId, companyObj?.name || "My Company");

        const [company, branchList, memberList, pendingInvites, limits] = await Promise.all([
          getCompanyWithBilling(companyInfo.companyId),
          getCompanyBranches(companyInfo.companyId),
          getCompanyMembers(companyInfo.companyId),
          getPendingInvitations(companyInfo.companyId),
          companyObj?.plan_id ? getPlanLimits(companyObj.plan_id) : Promise.resolve({ branchLimit: 1, userLimit: 5 }),
        ]);

        setCompanyData(company);
        setBranches(branchList);
        setMembers(memberList);
        setInvitations(pendingInvites);
        setPlanLimits(limits);
      } catch (err) {
        console.error("Failed to load onboarding data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      loadData();
    }
  }, [userId, setCompany]);

  const handleNext = () => {
    markStepCompleted(state.currentStep);
    nextStep();
  };

  const handleComplete = () => {
    resetState();
    router.push("/dashboard");
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <StepCompanyProfile
            companyId={state.companyId}
            initialData={companyData ? {
              logoUrl: companyData.logo_url,
              email: companyData.email,
              phone: companyData.phone,
              address: companyData.address,
              billingName: companyData.billing_name,
              billingDocument: companyData.billing_document,
              billingDocumentType: companyData.billing_document_type,
              billingAddress: companyData.billing_address,
              billingEmail: companyData.billing_email,
              billingPhone: companyData.billing_phone,
            } : undefined}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <StepBranches
            companyId={state.companyId}
            branches={branches}
            branchLimit={planLimits.branchLimit}
            onNext={handleNext}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <StepInviteTeam
            companyId={state.companyId}
            members={members}
            invitations={invitations}
            userLimit={planLimits.userLimit}
            onNext={handleNext}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <StepFinish
            companyName={state.companyName}
            completedSteps={state.completedSteps}
            onComplete={handleComplete}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <OnboardingHeader
        currentStep={state.currentStep}
        companyName={state.companyName}
      />
      
      <main className="flex-1 overflow-auto px-4 py-8">
        {renderStep()}
      </main>

      {state.currentStep < 4 && (
        <OnboardingFooter
          currentStep={state.currentStep}
          totalSteps={4}
          onNext={handleNext}
          onPrev={prevStep}
          onSkip={handleSkip}
        />
      )}
    </div>
  );
}
