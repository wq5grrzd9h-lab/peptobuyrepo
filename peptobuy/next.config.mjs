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
        // Route Apple Pay domain verification to API proxy.
        // Static files in /public/ take priority over rewrites, so the
        // public/.well-known/ file must NOT exist (it was deleted).
        source: "/.well-known/apple-developer-merchantid-domain-association",
        destination: "/api/apple-pay-verify",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/.well-known/apple-developer-merchantid-domain-association",
        headers: [
          { key: "Content-Type",  value: "application/octet-stream" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
};

export default nextConfig;
