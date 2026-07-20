import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gestion des colis",
  description: "Suivi des colis de l'agence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <nav>
          <Link href="/entree">Entrée📥</Link>
          {' | '}
          <Link href="/recherche">Recherche🔍</Link>
          {' | '}
          <Link href="/sortie">Sortie📤</Link>
          {' | '}
          <Link href="/deplacement">Déplacement📦</Link>
          {' | '}
          <Link href="/historique">Historique📜</Link>
          {' | '}          
          <Link href="/dispatch">Dispatch📊</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
