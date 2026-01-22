import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import GoogleAdSense from '@/components/ads/GoogleAdSense'
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

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
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
            <GoogleAdSense slot="HORIZONTAL" className="max-w-[728px] w-full" />
        </div>

        <main className="flex-1 container mx-auto px-4 py-8">
            {children}
        </main>

        <Footer />
        </div>
        <BackToTop />
    </ThemeProvider>
  )
}
