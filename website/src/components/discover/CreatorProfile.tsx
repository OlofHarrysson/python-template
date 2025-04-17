import Image from "next/image";
import Link from "next/link";
import { Creator } from "@/lib/feeds";

interface CreatorProfileProps {
  creator: Creator;
  showHeading?: boolean;
}

export function CreatorProfile({
  creator,
  showHeading = false,
}: CreatorProfileProps) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {showHeading && (
        <h2 className="text-sm font-medium text-neutral-500 mb-3">
          Created by
        </h2>
      )}

      <Link
        href={`https://bsky.app/profile/${creator.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 group"
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={creator.avatar || "/images/default-avatar.png"}
            alt={`@${creator.handle}`}
            fill
            sizes="40px"
            className="rounded-full object-cover"
          />
        </div>

        <div>
          <p className="font-medium text-neutral-700 group-hover:text-primary-600">
            {creator.display_name || `@${creator.handle}`}
          </p>
          <p className="text-sm text-neutral-500">@{creator.handle}</p>
        </div>
      </Link>
    </div>
  );
}
