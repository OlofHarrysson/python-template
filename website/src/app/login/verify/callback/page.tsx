"use client";

import dynamic from "next/dynamic";
import AuthLayout from "@/components/auth/AuthLayout";

// Dynamically import the VerifyCallback component with SSR disabled
const VerifyCallback = dynamic(
  () => import("@/components/auth/VerifyCallback"),
  {
    ssr: false,
    loading: () => (
      <AuthLayout
        title="Verifying Email"
        subtitle="Please wait while we verify your email address..."
        icon={<div className="loading loading-spinner loading-lg"></div>}
        state="loading"
      >
        <div></div>
      </AuthLayout>
    ),
  }
);

export default function VerifyCallbackPage() {
  return <VerifyCallback />;
}
