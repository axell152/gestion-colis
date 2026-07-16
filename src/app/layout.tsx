import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gestion des colis",
  description: "Suivi des colis de l'agence",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <nav
          style={{
            background: "#1f2937",
            padding: "15px",
            display: "flex",
            gap: "20px",
          }}
        >
          <Link         Accueil
          </Link>

          <entree
            Entrée
          </Link>

          /recherche
            Recherche
          </Link>

          <Link href="/historique" style={{ color:     </Link>

          <sortie
            Sortie
          </Link>

          <Link href="/dispatch" style={{ color    </Link>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
