import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Tulip Social",
    default: "Discover Feeds | Tulip Social",
  },
  description:
    "Explore and discover the best Bluesky feeds curated by category",
};

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
