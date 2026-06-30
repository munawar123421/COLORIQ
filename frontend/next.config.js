/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'coloriq-storage.blob.core.windows.net', 'coloriqstorage.blob.core.windows.net'],
  },
  // Optimize for faster page loads
  reactStrictMode: false, // Disable strict mode to prevent double rendering
  swcMinify: true, // Use SWC for faster minification
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console logs in production
  },
  // Optimize page loading
  experimental: {
    optimizeCss: true, // Optimize CSS loading
  },
}

module.exports = nextConfig