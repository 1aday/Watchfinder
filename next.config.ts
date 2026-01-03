import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow data URLs for captured photos
    unoptimized: true,
  },
};

export default nextConfig;
