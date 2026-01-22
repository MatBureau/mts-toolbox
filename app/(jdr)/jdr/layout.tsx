import { ThemeProvider } from '@/components/ThemeProvider'
import ToastProvider from '@/components/ui/ToastProvider'

export default function JdrLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans">
        <ToastProvider />
        {children}
      </div>
    </ThemeProvider>
  )
}
