import { prisma } from '@/lib/prisma'
import Link from 'next/link' 

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
<Link
  key={u.id}
  href={`/mobile/${u.id}?nom=${encodeURIComponent(u.name)}&role=${u.role}`}
  style={{
    padding: 16,
    fontSize: 18,
    cursor: 'pointer',
    border: '1px solid #888',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'inherit',
  }}
>
  {u.name} ({u.role})
</Link>  
))}
      </div>
    </main>
  )
}
