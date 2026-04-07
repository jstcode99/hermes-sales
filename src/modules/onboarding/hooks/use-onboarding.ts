"use client";

import { useState, useCallback, useEffect } from "react";

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingState {
  currentStep: OnboardingStep;
  companyId: string;
  companyName: string;
  completedSteps: OnboardingStep[];
}

const STORAGE_KEY = "onboarding_state";

const initialState: OnboardingState = {
  currentStep: 1,
  companyId: "",
  companyName: "",
  completedSteps: [],
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save state to storage on change
  const saveState = useCallback((newState: OnboardingState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  }, []);

  const setCompany = useCallback((companyId: string, companyName: string) => {
    setState((prev) => {
      const newState = { ...prev, companyId, companyName };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const nextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= 4) return prev;
      const newStep = (prev.currentStep + 1) as OnboardingStep;
      const newState = {
        ...prev,
        currentStep: newStep,
        completedSteps: prev.completedSteps.includes(prev.currentStep)
          ? prev.completedSteps
          : [...prev.completedSteps, prev.currentStep],
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const prevStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep <= 1) return prev;
      const newState = {
        ...prev,
        currentStep: (prev.currentStep - 1) as OnboardingStep,
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const goToStep = useCallback((step: OnboardingStep) => {
    setState((prev) => {
      const newState = { ...prev, currentStep: step };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const markStepCompleted = useCallback((step: OnboardingStep) => {
    setState((prev) => {
      if (prev.completedSteps.includes(step)) return prev;
      const newState = {
        ...prev,
        completedSteps: [...prev.completedSteps, step],
      };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  const resetState = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    state,
    isLoading,
    setCompany,
    nextStep,
    prevStep,
    goToStep,
    markStepCompleted,
    resetState,
  };
}
