"use client";

import { useState, useEffect, Suspense } from "react";
import { useActionState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  type FormState,
} from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/useAuth";
import { siteConfig } from "@/app/site-config";

const initialState: FormState = {
  message: undefined,
  errors: {},
};

// Component that handles search params - needs to be wrapped in Suspense
function SearchParamsHandler({
  onOAuthError,
}: {
  onOAuthError: (error: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");

  useEffect(() => {
    onOAuthError(oauthError);
  }, [oauthError, onOAuthError]);

  return null;
}

// Main login component
function LoginContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to callback URL
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(siteConfig.auth.callbackUrl);
    }
  }, [isAuthenticated, isLoading, router]);

  const [signInState, signInAction] = useActionState(
    signInWithEmail,
    initialState
  );
  const [signUpState, signUpAction] = useActionState(
    signUpWithEmail,
    initialState
  );

  const currentState = isSignUp ? signUpState : signInState;
  const currentAction = isSignUp ? signUpAction : signInAction;

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onOAuthError={setOauthError} />
      </Suspense>

      <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </h2>
          </div>

          {/* Simplified OAuth Error Display */}
          {oauthError && (
            <div className="alert alert-error">
              <span>Authentication failed. Please try again.</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="btn btn-outline w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-base-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-base-100 text-base-content">
                Or continue with email
              </span>
            </div>
          </div>

          <form action={currentAction} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input input-bordered w-full ${
                    currentState?.errors?.email ? "input-error" : ""
                  }`}
                  placeholder="Email address"
                />
                {currentState?.errors?.email && (
                  <div className="text-error text-sm mt-1">
                    {currentState.errors.email[0]}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  className={`input input-bordered w-full ${
                    currentState?.errors?.password ? "input-error" : ""
                  }`}
                  placeholder="Password"
                />
                {currentState?.errors?.password && (
                  <div className="text-error text-sm mt-1">
                    {currentState.errors.password[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Forgot Password Link - only show for sign in */}
            {!isSignUp && (
              <div className="text-right">
                <Link
                  href="/login/reset"
                  className="text-sm text-primary hover:text-primary-focus"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {currentState?.errors?.general && (
              <div className="alert alert-error">
                <span>{currentState.errors.general[0]}</span>
              </div>
            )}

            <div className="space-y-4">
              <button type="submit" className="btn btn-primary w-full">
                {isSignUp ? "Sign up" : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="btn btn-ghost btn-sm"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return <LoginContent />;
}
