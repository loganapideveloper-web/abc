/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  reactStrictMode: true,
  // Development only - no production optimizations
  compress: false,
  generateEtags: false,
};

module.exports = nextConfig;
