"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { completeOnboardingAction } from "@/modules/onboarding/actions/onboarding.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StepFinishProps {
  companyName: string;
  completedSteps: number[];
  onComplete: () => void;
  onPrev: () => void;
}

interface SummaryItem {
  label: string;
  value: string | boolean | number;
}

export function StepFinish({ companyName, completedSteps, onComplete, onPrev }: StepFinishProps) {
  const [isLoading, setIsLoading] = useState(false);

  const summary: SummaryItem[] = [
    { label: "Company Profile", value: completedSteps.includes(1) ? "Completed" : "Skipped" },
    { label: "Branches", value: completedSteps.includes(2) ? "Completed" : "Skipped" },
    { label: "Invite Team", value: completedSteps.includes(3) ? "Completed" : "Skipped" },
  ];

  async function handleComplete(skip = false) {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("skip", String(skip));
      
      await completeOnboardingAction(formData);
      toast.success("Onboarding completed!");
      onComplete();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">You're All Set!</CardTitle>
        <CardDescription>
          You've completed the setup for {companyName}. Here's a summary:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="rounded-lg border p-4">
          <h3 className="font-medium mb-3">Setup Summary</h3>
          <div className="space-y-2">
            {summary.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="flex items-center gap-1">
                  {item.value === "Completed" ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Completed</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Skipped</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* What's Next */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h3 className="font-medium mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Start managing your sales and invoices
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Add your products and services
            </li>
            <li className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              Invite more team members anytime
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => handleComplete(false)}
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? "Completing..." : "Complete Setup"}
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleComplete(true)}
            disabled={isLoading}
            className="w-full"
          >
            Skip for now
          </Button>
        </div>

        {/* Back */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={onPrev}>
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
