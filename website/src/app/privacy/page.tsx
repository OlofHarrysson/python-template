import Link from "next/link";
import { siteConfig } from "../site-config";
import { getSEOTags } from "@/lib/seo";

// You are an excellent lawyer.

// I need your help to write a simple Privacy Policy for my website. Here is some context:
// - Contact information: siteConfig.resend.fromAdmin.match(/<(.+?)>/)?.[1]
// - User data collected: none
// - Non-personal data collection: web cookies
// - Data storage location: EU servers
// - Data retention: None
// - User rights: Access, correct, delete their data
// - Governing Law: Sweden

// Please write a simple Privacy Policy for my site.

const lastUpdated = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const PrivacyText = `Privacy Policy for ${siteConfig.name}

Last updated: ${lastUpdated}

At ${
  siteConfig.name
}, we value your privacy and aim to be transparent about how we handle information.

1. Information We Collect

We do not collect any personal user data. Our platform uses:
- Essential cookies: For basic website functionality
- No account data is stored or retained

2. How We Use Cookies

- To provide core website functionality
- To remember basic preferences during your session
- We do not use cookies for tracking or advertising purposes

3. Data Protection

- We do not store any personal data
- Our service runs on EU servers
- We implement industry-standard security measures to protect our infrastructure

4. Your Rights

Even though we don't collect personal data, you have the right to:
- Know what cookies are being used
- Clear cookies through your browser settings
- Contact us with any privacy concerns

5. Third-Party Services

Our platform helps you discover custom feeds on the AT Protocol (Bluesky). We do not control the content or privacy practices of these third-party feeds.

6. Updates to Privacy Policy

We may update this policy occasionally. Changes will be effective immediately upon posting to our website.

7. Contact Us

Questions about privacy? Contact us at ${
  siteConfig.resend.fromAdmin.match(/<(.+?)>/)?.[1] || "olof@tandemfuture.com"
}.

This policy is governed by Swedish law.`;

export const metadata = getSEOTags({
  title: `Privacy Policy | ${siteConfig.name}`,
  canonicalUrlRelative: "/privacy",
});

const Privacy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {siteConfig.name}
        </h1>

        <div className="prose prose-sm sm:prose-base max-w-none">
          <p className="text-sm text-muted-foreground mb-4">
            Last Updated: {lastUpdated}
          </p>
          <div className="leading-relaxed whitespace-pre-line">
            {PrivacyText}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
