/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable SWC minification as fallback
  output: 'standalone', // For Docker deployment
}

module.exports = nextConfig
