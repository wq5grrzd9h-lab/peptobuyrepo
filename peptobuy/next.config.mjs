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
        source: "/.well-known/apple-developer-merchantid-domain-association",
        headers: [
          {
            key: "Content-Type",
            value: "text/plain",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
