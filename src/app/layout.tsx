import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestion des colis',
  description: "Suivi des colis de l'agence",
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
