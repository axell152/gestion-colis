import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const LABEL_TYPE: Record<string, string> = {
  ENTREE: 'Entrée',
  SORTIE: 'Sortie',
  DEPLACEMENT: 'Déplacement',
  AJUSTEMENT: 'Ajustement',
}

export default async function HistoriquePage() {
  const mouvements = await prisma.mouvement.findMany({
    orderBy: { date: 'desc' },
    take: 200,
    include: { colis: true, utilisateur: true },
  })

  return (
    <main style={{ padding: 24 }}>
      <h1>Historique des mouvements</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 16 }}>
        <thead>
          <tr>
            {['Date', 'Type', 'Colis', 'Référence', 'Détail', 'Utilisateur'].map((h) => (
              <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid #333', padding: 8 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mouvements.map((m) => (
            <tr key={m.id}>
              <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                {m.date.toLocaleString('fr-FR')}
              </td>
              <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{LABEL_TYPE[m.type]}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{m.colis.numeroColis}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{m.colis.reference}</td>
              <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                {m.type === 'AJUSTEMENT'
                ? `${m.quantiteAvant} → ${m.quantiteApres}`
                : m.type === 'DEPLACEMENT'
                ? `${m.emplacementAvant} → ${m.emplacementApres}`
                : m.type === 'ENTREE'
                ? `Qté : ${m.quantiteApres}`
                : m.type === 'SORTIE'
                ? `${m.emplacementAvant} → Sortie`
                : '—'}
              </td>
              <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{m.utilisateur.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
