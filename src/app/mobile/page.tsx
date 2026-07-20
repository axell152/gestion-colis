import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function MobilePage() {
  const utilisateurs = await prisma.user.findMany({
    where: {
      role: 'PREPARATEUR',
    },
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
  <button
    key={u.id}
    style={{
      padding: 16,
      fontSize: 18,
      cursor: 'pointer',
    }}
  >
    {u.name}
  </button>
))}
          >
            {u.name}
          </button>
        ))}
      </div>
    </main>
  )
}
