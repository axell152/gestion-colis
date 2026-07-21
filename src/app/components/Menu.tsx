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
  }, [])

  if (pathname === '/mobile') {
    return null
  }

  return (
    <nav>
      
      ROLE ACTUEL = {role}
      <br />
      
      <Link href="/entree">Entrée📥</Link>
      {' | '}
      <Link href ="recherche">Recherche🔍</Link>
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
