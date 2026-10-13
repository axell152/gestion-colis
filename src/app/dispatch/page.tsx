import { prisma } from '@/lib/prisma'
import { FINITIONS, FinitionCode, libelleFinition } from '@/lib/finition'
import RechercheForm from './RechercheForm'
import ExportExcel from './ExportExcel'

export const dynamic = 'force-dynamic'

// Premier numéro libre de la finition : comble les trous.
// On regarde TOUS les colis (EN_STOCK et SORTI) : un numéro déjà sorti du stock
// reste en base (numeroColis est unique) et n'est donc jamais proposé.
async function prochainNumeroColis(finition: FinitionCode): Promise<string | null> {
  if (!(finition in FINITIONS)) return null
  const prefixe = finition // E, B, G, A ou N : même lettre que le numéro de colis

  const existants = await prisma.colis.findMany({
    where: { numeroColis: { startsWith: prefixe } },
    select: { numeroColis: true },
  })

  const regex = new RegExp(`^${prefixe}(\\d+)$`)
  const utilises = new Set<number>()
  for (const { numeroColis } of existants) {
    const m = regex.exec(numeroColis.trim().toUpperCase())
    if (m) utilises.add(parseInt(m[1], 10))
  }

  let n = 1
  while (utilises.has(n)) n++

  return `${prefixe}${String(n).padStart(3, '0')}`
}

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: {
    finition?: string
    code?: string
    prochain?: string
  }
}) {
  const colisEnStock = await prisma.colis.findMany({
    where: { statut: 'EN_STOCK' },
    orderBy: { numeroColis: 'asc' },
  })

  type ColisItem = (typeof colisEnStock)[number]

  const finitionSelectionnee =
    (searchParams.finition as FinitionCode) || 'E'

  const colis = colisEnStock
    .filter((c: ColisItem) => c.finition === finitionSelectionnee)
    .filter(
      (c: ColisItem) =>
        !searchParams.code ||
        c.reference
          .toUpperCase()
          .includes(searchParams.code.toUpperCase())
    )

  const prochainNumero =
    searchParams.prochain === '1'
      ? await prochainNumeroColis(finitionSelectionnee)
      : null

  const hrefProchain =
    `/dispatch?finition=${finitionSelectionnee}` +
    (searchParams.code
      ? `&code=${encodeURIComponent(searchParams.code)}`
      : '') +
    `&prochain=1`

 return (
    <main className="p-4">
      <div className="max-w-2x1 mx-auto">
        <h1 className="text-xl font-semibold text-[#1A1A1A] text-center">Dispatch</h1>

        <div className="flex justify-center gap-2 mt-4 mb-6">
          {Object.keys(FINITIONS).map((code) => {
            const count = colisEnStock.filter(
              (c: ColisItem) => c.finition === code
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
                  whiteSpace: 'nowrap',
                  fontWeight:
                    finitionSelectionnee === code ? 'bold' : 'normal',
                }}
              >
                {libelleFinition(code as FinitionCode)} ({count})
              </a>
            )
          })}
        </div>

        <RechercheForm
          finitionSelectionnee={finitionSelectionnee}
          codeInitial={searchParams.code ?? ''}
        />

        <div className="flex justify-center items-center gap-3 mt-4">
          <a
            href={hrefProchain}
            style={{
              padding: '8px 12px',
              border: '1px solid #005B9E',
              borderRadius: 6,
              color: '#005B9E',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Prochain n° de colis
          </a>

          {searchParams.prochain === '1' && (
            <span style={{ fontWeight: 'bold', fontSize: 18 }}>
              {prochainNumero
                ? `${libelleFinition(finitionSelectionnee)} : ${prochainNumero}`
                : 'Finition inconnue'}
            </span>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <ExportExcel colisEnStock={colisEnStock} />
        </div>
      </div>

      <div className="mt-6">
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
                      textAlign: ['Quantité', 'N° Colis', 'Zone'].includes(h) ? 'center' : 'left',
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
              {colis.map((c: ColisItem) => (
                <tr key={c.id}>
                  <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                    {c.reference}
                  </td>

                  <td style={{ borderBottom: '1px solid #ddd', padding: 8 }}>
                    {c.designation}
                  </td>

                  <td style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                    {c.quantite}
                  </td>

                  <td style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                    <a
                      href={`/historique?numeroColis=${c.numeroColis}`}
                      style={{ color: '#005B9E', textDecoration: 'underline' }}
                    >
                      {c.numeroColis}
                    </a>
                  </td>

                  <td style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                    {c.emplacement}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
