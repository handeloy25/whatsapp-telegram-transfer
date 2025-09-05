import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './app/globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WhatsApp to Telegram Transfer Bot',
  description: 'Automatically transfer messages from WhatsApp community to Telegram and other WhatsApp groups with intelligent link replacement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
