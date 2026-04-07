"use client";

import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface OnboardingFooterProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function OnboardingFooter({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isLoading = false,
  className,
}: OnboardingFooterProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t bg-background px-6 py-4",
        className
      )}
    >
      {/* Back button */}
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={onPrev}
            disabled={isLoading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      {/* Skip button (optional for some steps) */}
      <div>
        {onSkip && !isLastStep && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        )}
      </div>

      {/* Next/Finish button */}
      <div>
        {isLastStep ? (
          <Button
            type="submit"
            form="onboarding-form"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              "Completing..."
            ) : (
              <>
                Complete Setup
                <Check className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={isLoading}
            className="gap-2"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
