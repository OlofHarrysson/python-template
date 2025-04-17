import { FeedCard } from "./FeedCard";
import { Feed } from "@/lib/feeds";

interface SimilarFeedsSectionProps {
  feeds: Feed[];
}

export function SimilarFeedsSection({ feeds }: SimilarFeedsSectionProps) {
  if (feeds.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg md:text-xl font-bold text-neutral-600 mb-4">
        Similar Feeds
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {feeds.map((feed) => (
          <FeedCard key={feed.uri} feed={feed} />
        ))}
      </div>
    </div>
  );
}
