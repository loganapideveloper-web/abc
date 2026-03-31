// Polyfill performance methods before Next.js initializes (fixes mgt.clearMarks build error)
if (typeof globalThis.performance !== 'undefined') {
  const _perf = globalThis.performance;
  if (typeof _perf.clearMarks !== 'function') _perf.clearMarks = () => {};
  if (typeof _perf.clearMeasures !== 'function') _perf.clearMeasures = () => {};
  if (typeof _perf.clearResourceTimings !== 'function') _perf.clearResourceTimings = () => {};
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
