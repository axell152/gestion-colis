import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const LABEL_TYPE: Record<string, string> = {
  ENTREE: 'Entrée',
  SORTIE: 'Sortie',
  DEPLACEMENT: 'Déplacement',
  AJUSTEMENT: 'Ajustement',
}

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
    <main style={{ padding: 24 }}>
      <h1>Historique des mouvements</h1>
      <form
  action="/historique"
  style={{
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
    marginBottom: 16,
  }}
>
  <label>
    Type :
    <select
      name="type"
      defaultValue={searchParams.type ?? ''}
      style={{ marginLeft: 8 }}
    >
      <option value="">Tous</option>
      <option value="ENTREE">Entrée</option>
      <option value="SORTIE">Sortie</option>
      <option value="DEPLACEMENT">Déplacement</option>
      <option value="AJUSTEMENT">Ajustement</option>
    </select>
  </label>

  <label>
    Utilisateur :
    <select
      name="utilisateur"
      defaultValue={searchParams.utilisateur ?? ''}
      style={{ marginLeft: 8 }}
    >
      <option value="">Tous</option>

      {utilisateurs.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  </label>

  <label>
    Code :
    <input
      type="text"
      name="code"
      placeholder="Rechercher un code"
      defaultValue={searchParams.code ?? ''}
      style={{
        marginLeft: 8,
        padding: 6,
      }}
    />
  </label>

  <button
    type="submit"
    style={{
      padding: '6px 12px',
    }}
  >
    Filtrer
  </button>

  <a      
  href="/historique"
    style={{ padding: '6px 12px', textDecoration: 'none', color: '#333' }}
  >
    Réinitialiser
  </a>
</form>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 16 }}>
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
    </main>
  )
}
