"use client";

import { useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import { Button } from "@components/ui/button";
import { toast } from "sonner";
import { signInWithGithubAction } from "../actions/oauth.actions";

interface GithubAuthButtonProps {
  className?: string;
}

export function GithubAuthButton({ className }: GithubAuthButtonProps) {
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
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <GitBranch className="size-4" />
      )}
      GitHub
    </Button>
  );
}
