import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth2'

export const metadata: Metadata = {
  title: 'Cart Whisperer - AI-Powered Abandoned Cart Recovery',
  description: 'Recover abandoned carts with AI-generated personalized emails',
  generator: 'v0.dev',
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
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
