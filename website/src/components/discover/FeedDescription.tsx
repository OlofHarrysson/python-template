interface FeedDescriptionProps {
  description: string;
}

export function FeedDescription({ description }: FeedDescriptionProps) {
  return (
    <div className="mb-6 md:mb-8">
      <h2 className="text-lg md:text-xl font-semibold mb-2 text-neutral-600">
        About this feed
      </h2>
      <p className="text-sm md:text-base text-neutral-600 whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
