import { prisma } from '@/lib/prisma'
import FormulaireUtilisateur from './FormulaireUtilisateur'

export const dynamic = 'force-dynamic'

export default async function UtilisateursPage() {
  const utilisateurs = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <main style={{ padding: 24 }}>
      <h1>Utilisateurs</h1>

      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          marginTop: 16,
        }}
      >
        <thead>
          <tr>
            {['Nom', 'Rôle'].map((h) => (
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
          {utilisateurs.map((u) => (
            <tr key={u.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
                {u.name}
              </td>

              <td style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
                {u.role}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    <FormulaireUtilisateur />  
    </main>
  )
}
