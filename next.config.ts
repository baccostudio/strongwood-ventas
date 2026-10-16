import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    minimumCacheTTL: 2678400,
    deviceSizes: [320, 384, 640, 750, 828, 1080, 1200, 1920],
    formats: ["image/webp"],
    qualities: [75],
  },
  async headers() {
    return [
      {
        source: "/assets/imgs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/assets/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
