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

const inter = Inter({ subsets: ['latin'] })
const GA_ID = "G-GEBQLBSF17";

export const metadata: Metadata = {
  title: 'MTS-Toolbox — Collection d\'outils en ligne gratuits',
  description: 'Découvrez 50+ outils en ligne gratuits pour le texte, le développement, les images, les calculs et plus encore.',
  keywords: ['outils en ligne', 'gratuit', 'convertisseur', 'calculateur', 'générateur', 'texte', 'développement'],
  authors: [{ name: 'MTS-Toolbox' }],
  manifest: '/manifest.json',
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MTS-Toolbox — Collection d\'outils en ligne gratuits',
    description: 'Découvrez 50+ outils en ligne gratuits pour le texte, le développement, les images, les calculs et plus encore.',
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
            strategy="afterInteractive"
          />
        )}
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />

            <div className="hidden md:flex justify-center py-4 border-b border-gray-200 dark:border-gray-800">
              <AdBanner id="ad-header" width={728} height={90} />
            </div>

            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>

            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
