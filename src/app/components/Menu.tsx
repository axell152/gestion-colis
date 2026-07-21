'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Menu() {
  const [role, setRole] = useState('')
  const [connecte, setConnecte] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('utilisateurId')
    const r = localStorage.getItem('role')

    if (id) {
      setConnecte(true)
    }

    if (r) {
      setRole(r)
    }
  }, [])

  if (!connecte) {
    return null
  }
  
  return (
    <nav>
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
