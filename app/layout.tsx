import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth2'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Cart Whisperer - AI-Powered Abandoned Cart Recovery',
  description: 'Recover abandoned carts with AI-generated personalized emails',
  generator: 'v0.dev',
}

// Loading component to display during navigation
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  )
}
