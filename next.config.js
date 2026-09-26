/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      "/api/invoices": ["./data/**/*"],
      "/api/invoices/[id]": ["./data/**/*"],
    },
  },
};

module.exports = nextConfig;
