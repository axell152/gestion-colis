import { prisma } from '@/lib/prisma'
import { FINITIONS, FinitionCode, libelleFinition } from '@/lib/finition'

export const dynamic = 'force-dynamic'

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: {
    finition?: string
    code?: string
  }
}) {
  const colisEnStock = await prisma.colis.findMany({
    where: { statut: 'EN_STOCK' },
    orderBy: { numeroColis: 'asc' },
  })

  const finitionSelectionnee =
    (searchParams.finition as FinitionCode) || 'BRUT'

  const colis = colisEnStock
  .filter((c) => c.finition === finitionSelectionnee)
  .filter(
    (c) =>
      !searchParams.code ||
      c.reference
        .toUpperCase()
        .includes(searchParams.code.toUpperCase())
  )
  
  return (
    <main style={{ padding: 24 }}>
      <h1>Dispatch des colis par finition</h1>
      <div
  style={{
    display: 'flex',
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  }}
>
  {Object.keys(FINITIONS).map((code) => {
    const count = colisEnStock.filter(
      (c) => c.finition === code
    ).length

    return (
      <a
        key={code}
        href={`/dispatch?finition=${code}`}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight:
            finitionSelectionnee === code ? 'bold' : 'normal',
        }}
      >
   /dispatch
  <input
    type="hidden"
    name="finition"
    value={finitionSelectionnee}
  />

  <input
    type="text"
    name="code"
    placeholder="Rechercher un code"
    defaultValue={searchParams.code ?? ''}
    style={{
      padding: 8,
      minWidth: 250,
    }}
  />

  <button
    type="submit"
    style={{
      marginLeft: 8,
      padding: '8px 12px',
    }}
  >
    Rechercher
  </button>
</form>
      
      <section>
  <h2>
    {finitionSelectionnee} — {libelleFinition(finitionSelectionnee)} ({colis.length})
  </h2>

  {colis.length === 0 ? (
    <p style={{ color: '#888' }}>
      Aucun colis en stock.
    </p>
  ) : (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {[
            'Code',
            'Libellé',
            'Quantité',
            'N° Colis',
            'Zone',
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
        {colis.map((c) => (
          <tr key={c.id}>
            <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
  {c.reference}
</td>

<td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
  {c.designation}
</td>

<td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
  {c.quantite}
</td>

<td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
  {c.numeroColis}
</td>

<td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
  {c.emplacement}
</td>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</section>
    </main>
  )
}
