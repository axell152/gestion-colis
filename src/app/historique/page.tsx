import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const LABEL_TYPE: Record<string, string> = {
  ENTREE: 'Entrée',
  SORTIE: 'Sortie',
  DEPLACEMENT: 'Déplacement',
  AJUSTEMENT: 'Ajustement',
}

const champClass =
  'w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

export default async function HistoriquePage({
  searchParams,
}: {
  searchParams: {
    type?: string
    utilisateur?: string
    code?: string
  }
}) {
  const utilisateurs = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  const mouvements = await prisma.mouvement.findMany({
    where: {
      ...(searchParams.type
        ? { type: searchParams.type as any }
        : {}),
      ...(searchParams.utilisateur
        ? { utilisateurId: searchParams.utilisateur }
        : {}),
      ...(searchParams.code
        ? {
            colis: {
              reference: {
                contains: searchParams.code,
                mode: 'insensitive',
              },
            },
          }
        : {}),
    },
    orderBy: { date: 'desc' },
    take: 200,
    include: { colis: true, utilisateur: true },
  })

  return (
    <main className="p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-[#1A1A1A] text-center">
          Historique des mouvements
        </h1>

        <form
          action="/historique"
          className="flex flex-col gap-3 mt-4"
        >
          <select
            name="type"
            defaultValue={searchParams.type ?? ''}
            className={champClass}
          >
            <option value="">Tous les types</option>
            <option value="ENTREE">Entrée</option>
            <option value="SORTIE">Sortie</option>
            <option value="DEPLACEMENT">Déplacement</option>
            <option value="AJUSTEMENT">Ajustement</option>
          </select>

          <select
            name="utilisateur"
            defaultValue={searchParams.utilisateur ?? ''}
            className={champClass}
          >
            <option value="">Tous les utilisateurs</option>
            {utilisateurs.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="code"
            placeholder="Rechercher un code"
            defaultValue={searchParams.code ?? ''}
            className={champClass}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition"
            >
              Filtrer
            </button>

            <a
              href="/historique"
              className="flex-1 py-3.5 rounded-xl border border-[#D9D2C4] text-[#1A1A1A] font-semibold text-base text-center active:scale-[0.98] transition"
            >
              Réinitialiser
            </a>
          </div>
        </form>
      </div>

      <div className="mt-6">
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {[
                'Type de mouvement',
                'Code',
                'Libellé',
                'N° Colis',
                'Quantité',
                'Zone',
                'Utilisateur',
                'Date',
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    borderBottom: '2px solid #333',
                    padding: 8,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {mouvements.map((m) => (
              <tr key={m.id}>
                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {LABEL_TYPE[m.type]}
                </td>

                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {m.colis.reference}
                </td>

                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {m.colis.designation}
                </td>

                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {m.colis.numeroColis}
                </td>

                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {m.quantiteApres ?? m.colis.quantite}
                </td>

                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {m.emplacementApres ?? m.colis.emplacement}
                </td>

                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {m.utilisateur.name}
                </td>

                <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                  {m.date.toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
