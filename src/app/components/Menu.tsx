'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

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

  return (
    <nav>
      <Link href="/entree">Entrée📥</Link>
      {' | '}
      <Link href="/recherche">Recherche🔍</Link>
      {' | '}
      <Link href="/sortie">Sortie📤</Link>
      {' | '}
      <Link href="/deplacement">Déplacement📦</Link>
      {' | '}
      <Link href="/quantite">Ajustements🔢</Link>

      {role === 'BUREAU' && (
        <>
          {' | '}
          <Link href="/historique">Historique📜</Link>

          {' | '}
          <Link href="/dispatch">Dispatch📊</Link>

          {' | '}
          <Link href="/utilisateurs">Utilisateurs👥</Link>
        </>
      )}
    </nav>
  )
}
