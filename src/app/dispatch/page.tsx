import { prisma } from '@/lib/prisma'
import { FINITIONS, FinitionCode, libelleFinition } from '@/lib/finition'

export const dynamic = 'force-dynamic'

export default async function DispatchPage() {
  const colisEnStock = await prisma.colis.findMany({
    where: { statut: 'EN_STOCK' },
    orderBy: { emplacement: 'asc' },
  })

  const parFinition = Object.keys(FINITIONS).map((code) => ({
    code: code as FinitionCode,
    colis: colisEnStock.filter((c) => c.finition === code),
  }))

  return (
    <main style={{ padding: 24 }}>
      <h1>Dispatch des colis par finition</h1>
      {parFinition.map(({ code, colis }) => (
        <section key={code} style={{ marginBottom: 32 }}>
          <h2>
            {code} — {libelleFinition(code)} ({colis.length})
          </h2>
          {colis.length === 0 ? (
            <p style={{ color: '#888' }}>Aucun colis en stock.</p>
          ) : (
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {['Numéro', 'Référence', 'Désignation', 'Emplacement', 'Quantité'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid #333', padding: 8 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colis.map((c) => (
                  <tr key={c.id}>
                    <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{c.numeroColis}</td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{c.reference}</td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{c.designation}</td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{c.emplacement}</td>
                    <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>{c.quantite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </main>
  )
}
