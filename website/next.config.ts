import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.bsky.app",
        pathname: "/img/**",
      },
    ],
  },
};

export default nextConfig;
