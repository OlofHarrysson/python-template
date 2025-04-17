type FeedSummary = {
  uri: string;
  display_name: string;
  avatar?: string;
};

export function generateCollectionSchema(
  categoryName: string,
  feeds: FeedSummary[],
  categoryUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} Feeds`,
    description: `Browse ${
      feeds.length
    } curated ${categoryName.toLowerCase()} feeds on Bluesky`,
    url: `https://tulipsocial.com${categoryUrl}`,

    // The feeds in this collection
    hasPart: feeds.map((feed) => ({
      "@type": "CreativeWork",
      name: feed.display_name,
      url: `https://tulipsocial.com/feed/${feed.uri.split("/").pop()}`,
      image: feed.avatar,
    })),
  };
}
