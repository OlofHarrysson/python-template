import { notFound } from "next/navigation";
import {
  getFeedByHandleAndName,
  getSimilarFeeds,
  getSortedFeedsByLikes,
} from "@/lib/feeds";
import { PageContainer } from "@/components/discover/PageContainer";
import { Breadcrumbs } from "@/components/discover/Breadcrumbs";
import { FeedHeader } from "@/components/discover/FeedHeader";
import { FeedDescription } from "@/components/discover/FeedDescription";
import { CreatorProfile } from "@/components/discover/CreatorProfile";
import { SimilarFeedsSection } from "@/components/discover/SimilarFeedsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateFeedSchema } from "@/lib/schema/feedSchema";
import Link from "next/link";

type PageParams = { creatorHandle: string; feedName: string };

export type FeedPageProps = {
  params: Promise<PageParams>;
};

export async function generateStaticParams() {
  const feeds = await getSortedFeedsByLikes();
  const topFeeds = feeds.slice(0, 10);

  return topFeeds.map((feed) => ({
    creatorHandle: feed.creator.handle,
    feedName: feed.name,
  }));
}

export default async function FeedPage(props: FeedPageProps) {
  const params = await props.params;
  const { creatorHandle, feedName } = params;
  const feed = await getFeedByHandleAndName(creatorHandle, feedName);

  if (!feed) {
    notFound();
  }

  const similarFeeds = await getSimilarFeeds(feed, 3);
  const blueskyFeedUrl = `https://bsky.app/profile/${feed.creator.did}/feed/${feed.name}`;
  const feedSchema = generateFeedSchema(feed, blueskyFeedUrl);

  return (
    <PageContainer>
      <JsonLd data={feedSchema} />

      <Link
        href="/discover"
        className="text-primary-500 hover:text-primary-600 text-sm md:text-base flex items-center gap-1 mb-4 md:mb-6"
      >
        <span>←</span> <span>Back to Discover</span>
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6 md:mb-8">
        <div className="p-4 md:p-6">
          <FeedHeader feed={feed} blueskyFeedUrl={blueskyFeedUrl} />
          <FeedDescription description={feed.description} />
          <CreatorProfile creator={feed.creator} showHeading={true} />
        </div>
      </div>

      <SimilarFeedsSection feeds={similarFeeds} />
    </PageContainer>
  );
}
