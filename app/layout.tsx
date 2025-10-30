import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CineMix - Descubre Películas',
  description: 'Busca y descubre películas con información detallada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
