/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  images: {
    domains: [
      'bonsaiprepagent.vercel.app',
      'bonsaiprepagent-staging.vercel.app',
      'supabase.co',
      'avatars.githubusercontent.com'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(self), geolocation=()'
        }
      ]
    },
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NODE_ENV === 'production' 
            ? 'https://bonsaiprepagent.vercel.app' 
            : 'http://localhost:3000'
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, POST, PUT, DELETE, OPTIONS'
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type, Authorization, X-Requested-With'
        },
        {
          key: 'Access-Control-Max-Age',
          value: '86400'
        }
      ]
    }
  ],
  rewrites: async () => [
    {
      source: '/api/webhooks/stripe',
      destination: '/api/webhooks/stripe'
    },
    {
      source: '/sitemap.xml',
      destination: '/api/sitemap'
    },
    {
      source: '/robots.txt',
      destination: '/api/robots'
    }
  ],
  redirects: async () => [
    {
      source: '/dashboard',
      destination: '/dashboard/overview',
      permanent: true
    },
    {
      source: '/admin',
      destination: '/admin/dashboard',
      permanent: true
    }
  ],
  webpack: (config, { dev, isServer }) => {
    // Basic path alias for demo
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src')
    };
    return config;
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  },
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },
  output: 'standalone',
  eslint: {
    dirs: ['src', 'pages']
  }
};

module.exports = nextConfig;