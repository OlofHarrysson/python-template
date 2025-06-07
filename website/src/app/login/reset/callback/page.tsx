"use client";

import { useState, useEffect, Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPassword, type FormState } from "@/lib/auth/actions";
import AuthLayout from "@/components/auth/AuthLayout";

const initialState: FormState = {
  message: undefined,
  errors: {},
};

// Component that handles search params - needs to be wrapped in Suspense
function SearchParamsHandler({
  onParamsChange,
}: {
  onParamsChange: (userId: string | null, secret: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");
    onParamsChange(userId, secret);
  }, [searchParams, onParamsChange]);

  return null;
}

// Main reset password component
function ResetPasswordContent({
  userId,
  secret,
}: {
  userId: string | null;
  secret: string | null;
}) {
  const [state, action] = useActionState(resetPassword, initialState);

  const isValidLink = !!(userId && secret);

  if (!isValidLink) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="This password reset link is invalid or has expired. Please request a new one."
        icon="⚠️"
        state="error"
      >
        <div className="text-center">
          <Link href="/login/reset" className="btn btn-primary">
            Request New Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (state?.success) {
    return (
      <AuthLayout
        title="Password Reset Successfully!"
        subtitle={state.message}
        icon="✓"
        state="success"
      >
        <div className="text-center">
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter your new password below."
    >
      <form action={action} className="space-y-6">
        {/* Hidden fields for userId and secret */}
        <input type="hidden" name="userId" value={userId || ""} />
        <input type="hidden" name="secret" value={secret || ""} />

        <div>
          <label htmlFor="password" className="sr-only">
            New Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={`input input-bordered w-full ${
              state?.errors?.password ? "input-error" : ""
            }`}
            placeholder="New password"
            minLength={8}
          />
          {state?.errors?.password && (
            <div className="text-error text-sm mt-1">
              {state.errors.password[0]}
            </div>
          )}
        </div>

        {state?.errors?.general && (
          <div className="alert alert-error">
            <span>{state.errors.general[0]}</span>
          </div>
        )}

        <div className="space-y-4">
          <button type="submit" className="btn btn-primary w-full">
            Set New Password
          </button>
        </div>

        <div className="text-center">
          <Link href="/login" className="btn btn-ghost btn-sm">
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordCallbackPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  const handleParamsChange = (
    newUserId: string | null,
    newSecret: string | null
  ) => {
    setUserId(newUserId);
    setSecret(newSecret);
  };

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsChange={handleParamsChange} />
      </Suspense>
      <ResetPasswordContent userId={userId} secret={secret} />
    </>
  );
}
