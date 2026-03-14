import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Math ML Journey — Het Tamboli',
  description: 'A living log of every exercise from Mathematical Foundations of Machine Learning.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
