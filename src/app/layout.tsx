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
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <nav
          style={{
            background: "#1f2937",
            padding: "12px 20px",
            display: "flex",
            gap: "20px",
          }}
        >
          <Link href="/entree Entrée
          </Link>

          /recherche: "white" }}>
            Recherche
          </Link>

          /historique
            Historique
          </Link>

          /sortie={{ color: "white" }}>
            Sortie
          </Link>

          /dispatch
            Dispatch
          </Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
