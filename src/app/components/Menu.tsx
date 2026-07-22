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
  { href: '/utilisateurs', label: 'Utilisateurs', icone: '👥' },
]

export default function Menu() {
  const [role, setRole] = useState('')
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

  if (pathname === '/mobile' || pathname.startsWith('/mobile/')) {
    return null
  }

  const tousLesLiens =
    role === 'BUREAU' ? [...liens, ...liensBureau] : liens

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-[#EAE4D9] px-2 py-2 overflow-x-auto">
      <div className="flex gap-2 w-max">
        {tousLesLiens.map((lien) => {
          const actif = pathname === lien.href

          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition ${
                actif
                  ? 'bg-[#E8703A] text-white'
                  : 'bg-[#F5F1EA] text-[#1A1A1A]'
              }`}
            >
              <span>{lien.icone}</span>
              {lien.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
