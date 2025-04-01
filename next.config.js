/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'puppeteer'];
    return config;
  },
}

module.exports = nextConfig 