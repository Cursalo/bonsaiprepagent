/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'stripe', 'openai'],
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@heroicons/react']
  },
  images: {
    domains: [
      'bonsai-sat-tutor.vercel.app',
      'bonsai-sat-tutor-staging.vercel.app',
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
            ? 'https://bonsai-sat-tutor.vercel.app' 
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
  webpack: (config, { dev, isServer, webpack }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src')
      };
    }

    // Add support for importing audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/audio/',
          outputPath: 'static/audio/'
        }
      }
    });

    // Optimize three.js for smaller bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      three: require('path').resolve('./node_modules/three')
    };

    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false
        })
      );
    }

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

// Bundle analyzer configuration
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}