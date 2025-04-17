import { Feed } from "@/lib/feeds";

export function generateFeedSchema(feed: Feed, blueskyFeedUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: feed.display_name,
    description: feed.description,
    author: {
      "@type": "Person",
      name: feed.creator.display_name || feed.creator.handle,
      url: `https://bsky.app/profile/${feed.creator.handle}`,
    },
    // keywords: feed.tags?.join(", "),
    url: blueskyFeedUrl,
    image: feed.avatar,
    // datePublished: feed.created_at || new Date().toISOString(),
    // dateModified: feed.updated_at || new Date().toISOString(),
    provider: {
      "@type": "Organization",
      name: "Bluesky",
      url: "https://bsky.app",
    },
    genre: feed.category,
  };
}
