"use client";

import Image from "next/image";
import { useState } from "react";
import { getFeedHeaderInfo } from "@/app/discover/blueskyActions";

interface BlueskyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  creatorDid?: string;
}

export function BlueskyImage({
  src,
  alt,
  width,
  height,
  className = "",
  creatorDid,
}: BlueskyImageProps) {
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageError = async () => {
    if (!creatorDid || hasError) return;

    setHasError(true);
    try {
      const profile = await getFeedHeaderInfo(creatorDid);
      if (profile?.avatar) {
        setFallbackSrc(profile.avatar);
      }
    } catch (error) {
      console.error("Failed to fetch fallback image:", error);
    }
  };

  return (
    <div className="relative">
      <Image
        src={fallbackSrc || src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={handleImageError}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
