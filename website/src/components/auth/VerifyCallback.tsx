"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/app/site-config";
import { account } from "@/lib/appwrite/client";
import { useAuth } from "@/lib/auth/useAuth";
import AuthLayout from "@/components/auth/AuthLayout";

export default function VerifyCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId || !secret) {
      setStatus("error");
      setErrorMessage(
        "Invalid verification link. The link may be expired or malformed."
      );
      return;
    }

    const handleVerification = async () => {
      try {
        await account.updateVerification(userId, secret);
        setStatus("success");

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push(siteConfig.auth.callbackUrl);
        }, 2000);
      } catch (error: any) {
        setStatus("error");
        if (error.message?.includes("expired")) {
          setErrorMessage(
            "Verification link has expired. Please request a new one."
          );
        } else if (error.message?.includes("invalid")) {
          setErrorMessage(
            "Invalid verification link. Please request a new one."
          );
        } else {
          setErrorMessage(
            error.message || "Verification failed. Please try again."
          );
        }
      }
    };

    handleVerification();
  }, [searchParams, router]);

  const handleAction = () => {
    if (user) {
      // User is logged in - go to verify page to resend email
      router.push(siteConfig.auth.verifyUrl);
    } else {
      // User is not logged in - go to login page
      router.push(siteConfig.auth.loginUrl);
    }
  };

  if (status === "loading") {
    return (
      <AuthLayout
        title="Verifying Email"
        subtitle="Please wait while we verify your email address..."
        icon={<div className="loading loading-spinner loading-lg"></div>}
        state="loading"
      >
        <div></div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout
        title="Email Verified Successfully!"
        subtitle="Your email has been verified. Redirecting to your dashboard..."
        icon="✓"
        state="success"
      >
        <div></div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verification Failed"
      subtitle={errorMessage}
      icon="✗"
      state="error"
    >
      <div className="flex justify-center">
        {!isLoading && (
          <button onClick={handleAction} className="btn btn-primary">
            {user
              ? "Request New Verification Email"
              : "Sign In to Request New Email"}
          </button>
        )}
      </div>
    </AuthLayout>
  );
}
