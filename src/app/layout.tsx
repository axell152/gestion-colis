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
          /entreeEntrée</Link>
          cherche">Recherche</Link>
          /historiqueHistorique</Link>
          /sortieSortie</Link>
          /dispatchDispatch</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
