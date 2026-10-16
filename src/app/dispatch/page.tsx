import { prisma } from '@/lib/prisma'
import { FINITIONS, FinitionCode, libelleFinition } from '@/lib/finition'
import RechercheForm from './RechercheForm'
import ExportExcel from './ExportExcel'

export const dynamic = 'force-dynamic'

// Les N premiers numéros libres de la finition : comble les trous.
// On regarde TOUS les colis (EN_STOCK et SORTI) : un numéro déjà sorti du stock
// reste en base (numeroColis est unique) et n'est donc jamais proposé.
async function prochainsNumerosColis(
  finition: FinitionCode,
  nombre: number
): Promise<string[]> {
  if (!(finition in FINITIONS)) return []
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

  const resultat: string[] = []
  let n = 1
  while (resultat.length < nombre) {
    if (!utilises.has(n)) {
      resultat.push(`${prefixe}${String(n).padStart(3, '0')}`)
    }
    n++
  }
  return resultat
}

export default async function DispatchPage({
  searchParams,
}: {
  searchParams: {
    finition?: string
    code?: string
    prochain?: string
    nombre?: string
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

  const nombreDemande = Math.min(
    Math.max(parseInt(searchParams.nombre ?? '1', 10) || 1, 1),
    50
  )

  const prochainsNumeros =
    searchParams.prochain === '1'
      ? await prochainsNumerosColis(finitionSelectionnee, nombreDemande)
      : []

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

        <form
          method="get"
          action="/dispatch"
          className="flex justify-center items-center gap-3 mt-4"
        >
          <input type="hidden" name="finition" value={finitionSelectionnee} />
          {searchParams.code && (
            <input type="hidden" name="code" value={searchParams.code} />
          )}
          <input type="hidden" name="prochain" value="1" />

          <label style={{ whiteSpace: 'nowrap' }}>
            Nombre de colis{' '}
            <input
              type="number"
              name="nombre"
              min={1}
              max={50}
              defaultValue={nombreDemande}
              style={{
                width: 64,
                padding: '6px 8px',
                border: '1px solid #ccc',
                borderRadius: 6,
                textAlign: 'center',
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              padding: '8px 12px',
              border: '1px solid #005B9E',
              borderRadius: 6,
              color: '#005B9E',
              background: 'white',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            Prochains n° de colis
          </button>
        </form>

        {searchParams.prochain === '1' && (
          <div className="mt-3 text-center">
            {prochainsNumeros.length === 0 ? (
              <span style={{ fontWeight: 'bold' }}>Finition inconnue</span>
            ) : (
              <>
                <div style={{ color: '#555', marginBottom: 6 }}>
                  {libelleFinition(finitionSelectionnee)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {prochainsNumeros.map((num) => (
                    <span
                      key={num}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #005B9E',
                        borderRadius: 6,
                        fontWeight: 'bold',
                        fontSize: 18,
                      }}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
