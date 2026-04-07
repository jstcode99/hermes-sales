"use client";

import { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { Button } from "@components/ui/button";
import { toast } from "sonner";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface GoogleAuthButtonProps {
  mode: "signin" | "signup";
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function GoogleAuthButton({
  mode,
  onSuccess,
  onError,
  isLoading: externalLoading,
  className,
}: GoogleAuthButtonProps) {

  if (!googleClientId) {
    return (
      <Button type="button" variant="outline" className={className} disabled>
        Google OAuth not configured
      </Button>
    );
  }

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error("No credential received from Google");
      return;
    }
    try {
      await onSuccess(credentialResponse.credential);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      onError?.(message);
      toast.error(message);
    }
  };

  const handleError = () => {
    const message = "Google authentication failed";
    onError?.(message);
    toast.error(message);
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        shape="rectangular"
        text={mode === "signin" ? "signin_with" : "signup_with"}
      />
    </GoogleOAuthProvider>
  );
}

interface GoogleSignInButtonProps {
  className?: string;
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  return (
    <GoogleAuthButton
      mode="signin"
      onSuccess={async (credential) => {
        // Server action to handle Google OAuth sign in
        const { signInWithGoogleAction } = await import("../actions/oauth.actions");
        await signInWithGoogleAction(credential);
      }}
      className={className}
    />
  );
}

interface GoogleSignUpButtonProps {
  className?: string;
}

export function GoogleSignUpButton({ className }: GoogleSignUpButtonProps) {
  return (
    <GoogleAuthButton
      mode="signup"
      onSuccess={async (credential) => {
        const { signUpWithGoogleAction } = await import("../actions/oauth.actions");
        await signUpWithGoogleAction(credential);
      }}
      className={className}
    />
  );
}
