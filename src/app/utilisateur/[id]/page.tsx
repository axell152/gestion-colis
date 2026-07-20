import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function UtilisateurPage() {
  const utilisateurs = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <main style={{ padding: 24 }}>
      <h1>Qui êtes-vous ?</h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 24,
          maxWidth: 300,
        }}
      >
        {utilisateurs.map((u) => (
          {`/utilisateur/${u.id}`}
            {u.name}
          </Link>
        ))}
      </div>
    </main>
  )
}
