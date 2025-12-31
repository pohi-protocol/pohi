import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PoHI - Proof of Human Intent',
  description: 'Cryptographic proof that a human approved your code. AI executes. Humans authorize. Machines verify.',
  keywords: ['proof of human', 'world id', 'zero knowledge', 'git signing', 'ai safety', 'human approval'],
  authors: [{ name: 'Ikko Eltociear Ashimine', url: 'https://github.com/eltociear' }],
  creator: 'PoHI Protocol',
  metadataBase: new URL('https://pohi-demo.vercel.app'),
  openGraph: {
    title: 'PoHI - Proof of Human Intent',
    description: 'Cryptographic proof that a human approved your code. AI executes. Humans authorize. Machines verify.',
    url: 'https://pohi-demo.vercel.app',
    siteName: 'PoHI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PoHI - Proof of Human Intent',
    description: 'Cryptographic proof that a human approved your code.',
    creator: '@eltaborgar',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
