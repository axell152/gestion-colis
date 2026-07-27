import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HistoriqueInventaireDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const inventaire = await prisma.inventaireTournant.findUnique({
    where: { id: params.id },
    include: { lignes: true },
  })

  if (!inventaire) {
    notFound()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <Link href="/inventaire" className="text-sm text-[#E8703A] underline">
        ← Retour à l'inventaire
      </Link>

      <h1 className="text-xl font-bold text-[#1A1A1A]">
        Inventaire du {inventaire.date.toLocaleDateString('fr-FR')}
      </h1>

      <div className="overflow-x-auto rounded-xl border border-[#EAE4D9]">
        <table className="w-full">
          <thead className="bg-[#F5F1EA] text-left text-xs uppercase text-[#ADA695]">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Libellé</th>
              <th className="px-3 py-2">Emplacement</th>
              <th className="px-3 py-2">Service</th>
              <th className="px-2 py-2">Q. comptée</th>
              <th className="px-2 py-2">Q. dispo</th>
              <th className="px-3 py-2 text-center">Écart</th>
              <th className="px-3 py-2">Compté par</th>
              <th className="px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {inventaire.lignes.map((ligne) => {
              const difference =
                ligne.quantiteComptee !== null && ligne.quantiteDispo !== null
                  ? ligne.quantiteComptee - ligne.quantiteDispo
                  : null

              const differenceClass =
                difference === null
                  ? 'text-[#ADA695]'
                  : difference < 0
                    ? 'text-[#C00000] font-bold'
                    : difference > 0
                      ? 'text-[#0046C8] font-bold'
                      : 'text-[#1A1A1A] font-semibold'

              return (
                <tr key={ligne.id} className="border-b border-[#F5F1EA]">
                  <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{ligne.code}</td>
                  <td className="px-3 py-2 text-sm whitespace-nowrap">{ligne.libelle}</td>
                  <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap">{ligne.emplacement}</td>
                  <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap">{ligne.service}</td>
                  <td className="px-2 py-2 text-sm text-center">{ligne.quantiteComptee ?? '—'}</td>
                  <td className="px-2 py-2 text-sm text-center">{ligne.quantiteDispo ?? '—'}</td>
                  <td className={`px-3 py-2 text-sm text-center ${differenceClass}`}>
                    {difference !== null ? difference : '—'}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap">
                    {ligne.compteParNom ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap">
                    {ligne.dateComptage ? new Date(ligne.dateComptage).toLocaleString('fr-FR') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
