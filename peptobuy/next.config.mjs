/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Rewrite Apple Pay domain verification to API route.
        // Static files in /public/ take priority over rewrites, so the
        // public/.well-known/ file must NOT exist (was deleted).
        // The App Router route at app/.well-known/.../ also handles this
        // directly; the rewrite is a belt-and-suspenders fallback.
        source: "/.well-known/apple-developer-merchantid-domain-association",
        destination: "/api/apple-pay-domain",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-developer-merchantid-domain-association",
        headers: [
          { key: "Content-Type",  value: "application/octet-stream" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
