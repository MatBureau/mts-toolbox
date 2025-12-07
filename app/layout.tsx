import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdBanner from '@/components/ads/AdBanner'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { env } from '@/lib/env'
import Script from 'next/script'
import Particles from '@/components/ui/Particles'
import ToastProvider from '@/components/ui/ToastProvider'
import BackToTop from '@/components/ui/BackToTop'
import CommandPalette from '@/components/CommandPalette'

const inter = Inter({ subsets: ['latin'] })
const GA_ID = "G-GEBQLBSF17";

export const metadata: Metadata = {
  metadataBase: new URL('https://mts-toolbox.com'),
  title: 'MTS-Toolbox — Collection d\'outils en ligne gratuits',
  description: 'Découvrez 50+ outils en ligne gratuits pour le texte, le développement, les images, les calculs et plus encore.',
  keywords: ['outils en ligne', 'gratuit', 'convertisseur', 'calculateur', 'générateur', 'texte', 'développement'],
  authors: [{ name: 'MTS-Toolbox' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MTS-Toolbox',
  },
  openGraph: {
    title: 'MTS-Toolbox — Collection d\'outils en ligne gratuits',
    description: 'Découvrez 50+ outils en ligne gratuits pour le texte, le développement, les images, les calculs et plus encore.',
    type: 'website',
    locale: 'fr_FR',
    url: 'https://mts-toolbox.com',
    siteName: 'MTS-Toolbox',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTS-Toolbox — Collection d\'outils en ligne gratuits',
    description: 'Découvrez 50+ outils en ligne gratuits pour le texte, le développement, les images, les calculs et plus encore.',
  },
  alternates: {
    canonical: 'https://mts-toolbox.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch and Preconnect for Performance */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Script de Google tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-script" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        {env.GA_MEASUREMENT_ID && <GoogleAnalytics gaId={env.GA_MEASUREMENT_ID} />}
        {env.ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${env.ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}
        <ThemeProvider>
          <ToastProvider />
          <CommandPalette />
          {/* Particles background */}
          <div className="fixed inset-0 -z-10 opacity-60 dark:opacity-50">
            <Particles
              particleColors={['#0F2257', '#1B3C98', '#2656D9', '#6789E4', '#A8BBF0']}
              particleCount={250}
              particleSpread={8}
              speed={0.08}
              particleBaseSize={120}
              moveParticlesOnHover={true}
              particleHoverFactor={0.8}
              alphaParticles={true}
              disableRotation={false}
              sizeRandomness={2}
              pixelRatio={1.5}
            />
          </div>

          <div className="flex flex-col min-h-screen relative z-0">
            <Header />

            <div className="hidden md:flex justify-center py-4 border-b border-gray-200 dark:border-gray-800">
              <AdBanner id="ad-header" width={728} height={90} />
            </div>

            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>

            <Footer />
          </div>
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  )
}
