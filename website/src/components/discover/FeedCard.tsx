import Link from "next/link";
import { Feed } from "@/lib/feeds";
import { BlueskyImage } from "./BlueskyImage";

interface FeedCardProps {
  feed: Feed;
  priority?: boolean;
  className?: string;
}

export function FeedCard({
  feed,
  priority = false,
  className = "",
}: FeedCardProps) {
  const feedName = feed.name;

  return (
    <div className={`overflow-hidden ${className}`}>
      <Link
        href={`/discover/feed/${feed.creator.handle}/${feedName}`}
        className="block p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow hover:border-primary-300"
      >
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <BlueskyImage
              src={feed.avatar || "/assets/avatar.png"}
              alt={`${feed.display_name} avatar`}
              width={48}
              height={48}
              className="rounded-full object-cover"
              creatorDid={feed.creator.did}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold mb-1 text-neutral-700 truncate">
              {feed.display_name}
            </h3>
            <p className="text-sm text-neutral-500 mb-2 line-clamp-2">
              {feed.description}
            </p>
            <div className="flex items-center text-xs text-neutral-500">
              <span className="flex items-center">
                by @{feed.creator.handle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs md:text-sm text-neutral-500">
            ❤️ {feed.like_count.toLocaleString()}
          </span>
        </div>
      </Link>
    </div>
  );
}
