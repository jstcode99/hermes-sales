"use client";

import { cn } from "@/lib/utils/utils";
import { Check } from "lucide-react";

interface OnboardingHeaderProps {
  currentStep: number;
  companyName?: string;
  className?: string;
}

const steps = [
  { id: 1, title: "Company Profile" },
  { id: 2, title: "Branches" },
  { id: 3, title: "Invite Team" },
  { id: 4, title: "Finish" },
];

export function OnboardingHeader({ currentStep, companyName, className }: OnboardingHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Company name */}
      {companyName && (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{companyName}</h1>
          <p className="text-sm text-muted-foreground">Complete your setup</p>
        </div>
      )}

      {/* Progress steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-background text-primary",
                    !isCompleted && !isCurrent && "border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>

                {/* Step label - hidden on small screens */}
                <span
                  className={cn(
                    "ml-2 text-sm font-medium hidden sm:inline-block",
                    isCompleted && "text-primary",
                    isCurrent && "text-primary",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 w-8 sm:w-12 transition-colors",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-auto max-w-md">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Step {currentStep} of 4
        </p>
      </div>
    </div>
  );
}
