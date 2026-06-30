import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'COLORIQ - AI-Based Color Correction System',
  description: 'Solve the pervasive problem of color mismatch between online clothing images and real-life products with AI-powered color correction.',
  keywords: 'AI, color correction, e-commerce, clothing, image processing, machine learning',
  authors: [{ name: 'COLORIQ Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  )
}