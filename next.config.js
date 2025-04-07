/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    // Empty but kept for potential future options
  },
  // Add proper server external packages config
  serverExternalPackages: ['puppeteer'],
  // Single webpack config that handles all cases
  webpack: (config, { dev, isServer }) => {
    // Add puppeteer to externals
    config.externals = [...(config.externals || []), 'puppeteer'];
    
    // Fix HMR issues in development
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  // Add CORS configuration for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' }
        ]
      }
    ];
  },
  // Allow cross-origin requests in development
  async rewrites() {
    return [
      {
        source: '/_next/:path*',
        destination: '/_next/:path*',
      }
    ];
  },
  // Allow origin for dev tools
  allowedDevOrigins: ['adhi1.btc.cfd'],
}

module.exports = nextConfig 