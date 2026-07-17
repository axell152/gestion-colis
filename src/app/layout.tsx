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
        <nav
          style={{
            padding: "10px",
            backgroundColor: "#f0f0f0",
            display: "flex",
            gap: "15px",
          }}
        >
          /entreeEntrée</Link>
          /rechercheRecherche</Link>
          /historiqueHistorique</Link>
          /sortieSortie</Link>
          /dispatchDispatch</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
