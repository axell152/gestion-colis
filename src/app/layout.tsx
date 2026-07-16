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
          /
            Accueil
          </Link>

          <Link href="/entree" style={{ color: "white>

          <Link href="/recherche" style={{ color: "whiteink>

          <Link href="/historique" style={{ color: "white",nk>

          <Link href="/sortie" style={{ color: "white",
          dispatch" style={{ color: "white", textDecoration: "none" }}>
            Dispatch
          </Link>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
