"use client";

import { useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import { signInWithGithubAction } from "../actions/oauth.actions";

interface GithubAuthButtonProps {
  mode: "signin" | "signup";
  className?: string;
}

export function GithubAuthButton({ mode, className }: GithubAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGithubAction();
    } catch (error) {
      const message = error instanceof Error ? error.message : "GitHub authentication failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleGithubAuth}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GitBranch className="mr-2 h-4 w-4" />
      )}
      {mode === "signin" ? "Sign in with GitHub" : "Sign up with GitHub"}
    </Button>
  );
}
