import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bonsai-sat-tutor.com'),
  title: {
    default: 'Bonsai SAT Tutor - AI-Powered SAT Preparation',
    template: '%s | Bonsai SAT Tutor'
  },
  description: 'Master the SAT with Bonsai, your intelligent AI tutor. Real-time help, personalized learning, and gamified progress tracking.',
  keywords: [
    'SAT prep',
    'AI tutor',
    'test preparation',
    'college board',
    'SAT practice',
    'study assistant',
    'education technology',
    'personalized learning'
  ],
  authors: [{ name: 'Bonsai Education Inc.' }],
  creator: 'Bonsai Education Inc.',
  publisher: 'Bonsai Education Inc.',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bonsai-sat-tutor.com',
    title: 'Bonsai SAT Tutor - AI-Powered SAT Preparation',
    description: 'Master the SAT with Bonsai, your intelligent AI tutor featuring real-time help and personalized learning.',
    siteName: 'Bonsai SAT Tutor',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bonsai SAT Tutor - AI-Powered Learning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bonsai SAT Tutor - AI-Powered SAT Preparation',
    description: 'Master the SAT with Bonsai, your intelligent AI tutor.',
    images: ['/og-image.png'],
    creator: '@BonsaiEducation',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    yahoo: 'your-yahoo-verification',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/_next/static/media/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//api.openai.com" />
        <link rel="dns-prefetch" href="//generativelanguage.googleapis.com" />
        <link rel="dns-prefetch" href="//api.stripe.com" />
        <link rel="dns-prefetch" href="//js.stripe.com" />
        
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://generativelanguage.googleapis.com" />
        <link rel="preconnect" href="https://api.stripe.com" />
        
        {/* Theme color for browser chrome */}
        <meta name="theme-color" content="#22c55e" />
        <meta name="color-scheme" content="dark light" />
        
        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bonsai SAT" />
        
        {/* Microsoft-specific meta tags */}
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Bonsai SAT Tutor',
              description: 'AI-powered SAT preparation platform with real-time tutoring and personalized learning paths.',
              url: 'https://bonsai-sat-tutor.com',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web, Chrome Extension, Desktop',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                priceValidUntil: '2025-12-31',
                description: 'Free plan available with premium subscriptions starting at $19.99/month'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '10000',
                bestRating: '5',
                worstRating: '1'
              },
              author: {
                '@type': 'Organization',
                name: 'Bonsai Education Inc.',
                url: 'https://bonsai-sat-tutor.com'
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Skip to main content
        </a>
        
        {/* Main application content */}
        <div id="main-content" className="relative">
          {children}
        </div>
        
        {/* Toast notifications container */}
        <div id="toast-root" />
        
        {/* Modal container */}
        <div id="modal-root" />
        
        {/* Bonsai bubble container */}
        <div id="bonsai-root" />
        
        {/* Analytics and monitoring - removed for demo */}
        
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
        />
        
        {/* Error boundary fallback */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                console.error('Global error:', e.error);
                // You could send this to your error tracking service
              });
              
              window.addEventListener('unhandledrejection', function(e) {
                console.error('Unhandled promise rejection:', e.reason);
                // You could send this to your error tracking service
              });
            `,
          }}
        />
      </body>
    </html>
  );
}