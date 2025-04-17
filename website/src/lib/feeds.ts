import path from "path";
import fs from "fs";

export type Creator = {
  did: string;
  handle: string;
  display_name: string;
  avatar?: string;
  description?: string;
};

export type Feed = {
  uri: string; // Primary ID
  name: string; // The last part of the URI
  cid: string;
  display_name: string;
  avatar?: string;
  description: string;
  like_count: number;
  category: string;
  creator: Creator;
};

export type Category = {
  name: string;
  slug: string;
  emoji: string;
  count?: number;
};

export async function getFeeds(): Promise<Feed[]> {
  const filePath = path.join(
    process.cwd(),
    "../backend/data/feed_index",
    "categorized_feeds.json"
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const feeds: Feed[] = JSON.parse(fileContents);

  return feeds.map((feed) => ({
    ...feed,
    name: feed.uri.split("/").pop() ?? "",
  }));
}

export async function getCategories(): Promise<Category[]> {
  const feeds = await getFeeds();

  // Load the categories from the JSON file
  const categoriesFilePath = path.join(
    process.cwd(),
    "../backend/data/feed_index",
    "categories.json"
  );
  const categoriesFileContents = fs.readFileSync(categoriesFilePath, "utf8");
  const categories: Category[] = JSON.parse(categoriesFileContents);

  // Count feeds per category
  const categoryCounts: Record<string, number> = {};
  feeds.forEach((feed) => {
    categoryCounts[feed.category] = (categoryCounts[feed.category] || 0) + 1;
  });

  // Add counts to categories
  return categories
    .map((category) => ({
      ...category,
      count: categoryCounts[category.name] || 0,
    }))
    .sort((a, b) => (b.count || 0) - (a.count || 0));
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | undefined> {
  const categories = await getCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getFeedsByCategory(category: string): Promise<Feed[]> {
  const feeds = await getFeeds();
  return feeds.filter(
    (feed) => feed.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getSimilarFeeds(feed: Feed, limit = 3): Promise<Feed[]> {
  const feeds = await getFeeds();

  return feeds
    .filter((f) => f.category === feed.category && f.uri !== feed.uri)
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, limit);
}

export async function getFeedByHandleAndName(
  creatorHandle: string,
  feedName: string
): Promise<Feed | undefined> {
  const feeds = await getFeeds();
  return feeds.find(
    (feed) => feed.creator.handle === creatorHandle && feed.name === feedName
  );
}

export async function getSortedFeedsByLikes(): Promise<Feed[]> {
  const feeds = await getFeeds();
  const sortedFeeds = feeds.sort((a, b) => b.like_count - a.like_count);
  return sortedFeeds;
}
