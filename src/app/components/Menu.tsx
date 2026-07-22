'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const liens = [
  { href: '/entree', label: 'Entrée', icone: '📥' },
  { href: '/recherche', label: 'Recherche', icone: '🔍' },
  { href: '/sortie', label: 'Sortie', icone: '📤' },
  { href: '/deplacement', label: 'Déplacement', icone: '📦' },
  { href: '/quantite', label: 'Ajustements', icone: '🔢' },
]

const liensBureau = [
  { href: '/historique', label: 'Historique', icone: '📜' },
  { href: '/dispatch', label: 'Dispatch', icone: '📊' },
  { href: '/utilisateur', label: 'Utilisateurs', icone: '👥' },
]

export default function Menu() {
  const [role, setRole] = useState('')
  const [ouvert, setOuvert] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const chargerRole = () => {
      const r = localStorage.getItem('role') ?? ''
      setRole(r)
    }

    chargerRole()

    window.addEventListener('role-changed', chargerRole)

    return () =>
      window.removeEventListener('role-changed', chargerRole)
  }, [])

  useEffect(() => {
    setOuvert(false)
  }, [pathname])

  if (pathname === '/mobile' || pathname.startsWith('/mobile/')) {
    return null
  }

  const tousLesLiens =
    role === 'BUREAU' ? [...liens, ...liensBureau] : liens

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-[#EAE4D9]">
      <button
        onClick={() => setOuvert(!ouvert)}
        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#1A1A1A]"
      >
        <span className="text-lg leading-none">☰</span>
        Menu
      </button>

      {ouvert && (
        <div className="flex flex-col border-t border-[#EAE4D9]">
          {tousLesLiens.map((lien) => {
            const actif = pathname === lien.href

            return (
              <Link
                key={lien.href}
                href={lien.href}
                className={`flex items-center gap-3 px-4 py-3 text-base border-b border-[#F5F1EA] ${
                  actif
                    ? 'bg-[#FBEADD] text-[#E8703A] font-semibold'
                    : 'text-[#1A1A1A]'
                }`}
              >
                <span className="text-lg">{lien.icone}</span>
                {lien.label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
