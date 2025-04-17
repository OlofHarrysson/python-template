import { Feed } from "@/lib/feeds";
import { BlueskyImage } from "@/components/discover/BlueskyImage";

interface FeedHeaderProps {
  feed: Feed;
  blueskyFeedUrl: string;
}

export function FeedHeader({ feed, blueskyFeedUrl }: FeedHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
      <div className="flex items-center mb-4 md:mb-0">
        {feed.avatar && (
          <div className="mr-3 md:mr-4 rounded-full overflow-hidden w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
            <BlueskyImage
              src={feed.avatar}
              alt={feed.display_name}
              width={64}
              height={64}
              className="object-cover"
              creatorDid={feed.creator.did}
            />
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-600">
            {feed.display_name}
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-1">
            Category: {feed.category}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <span className="text-neutral-600 flex items-center text-sm md:text-base">
          <span className="mr-1">❤️</span>
          {feed.like_count.toLocaleString()} likes
        </span>

        <a
          href={blueskyFeedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-accent-500 hover:bg-accent-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-base font-semibold transition-colors"
        >
          View on Bluesky
        </a>
      </div>
    </div>
  );
}
