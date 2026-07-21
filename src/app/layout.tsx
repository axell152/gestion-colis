import type { Metadata } from "next";
import Link from "next/link";
import Menu from '@/app/components/Menu'

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
        <Menu />

        {children}
      </body>
    </html>
  );
}
