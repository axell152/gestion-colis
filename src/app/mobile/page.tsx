import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MobilePage() {
  const utilisateurs = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <main className="min-h-screen bg-[#F5F1EA] flex flex-col items-center px-6 pt-16">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-[#1A1A1A] text-center">
          Qui êtes-vous ?
        </h1>
        <p className="text-sm text-[#8A8378] text-center mt-2 mb-10">
          Sélectionnez votre profil pour commencer
        </p>

        <div className="flex flex-col gap-3">
          {utilisateurs.map((u) => {
            const initiale = u.name.charAt(0).toUpperCase()
            const estBureau = u.role === 'BUREAU'

            return (
              <Link
                key={u.id}
                href={`/mobile/${u.id}?nom=${encodeURIComponent(u.name)}&role=${u.role}`}
                className="flex items-center gap-4 bg-white rounded-2xl px-4 py-4 shadow-sm border border-[#EAE4D9] active:scale-[0.98] active:bg-[#FBF9F5] transition"
              >
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#E8703A] text-white flex items-center justify-center text-lg font-semibold">
                  {initiale}
                </div>

                <div className="flex-1 text-center text-base font-medium text-[#1A1A1A]">
                  {u.name}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
