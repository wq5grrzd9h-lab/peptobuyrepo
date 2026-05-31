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
  async headers() {
    return [
      {
        // Apple Pay domain verification — file lives at
        // public/.well-known/apple-developer-merchantid-domain-association
        // No rewrite needed: Next.js serves /public/ files directly.
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
