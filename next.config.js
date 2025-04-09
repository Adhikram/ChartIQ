/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'ta.btc.cfd'],
  },
  experimental: {
    // Enable WebSocket support
    webpackBuildWorker: true,
  },
  // Add proper server external packages config
  serverExternalPackages: ['puppeteer', 'pg', 'pg-native'],
  // Single webpack config that handles all cases
  webpack: (config, { dev, isServer }) => {
    // Add puppeteer and pg to externals
    config.externals = [...(config.externals || []), 'puppeteer', 'pg'];
    
    // Handle pg dependencies for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        fs: false,
        net: false,
        tls: false,
        child_process: false
      };
    }
    
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
          { key: 'Access-Control-Allow-Origin', value: 'https://ta.btc.cfd' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' }
        ]
      },
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://ta.btc.cfd' }
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
  // Allow origin for dev tools and production domain
  allowedDevOrigins: ['adhi1.btc.cfd', 'ta.btc.cfd', 'https://ta.btc.cfd'],
}

module.exports = nextConfig 