'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UtilisateurActuel() {
  const [nom, setNom] = useState('')

  useEffect(() => {
    const utilisateurNom =
      localStorage.getItem('utilisateurNom')

    if (utilisateurNom) {
      setNom(utilisateurNom)
    }
  }, [])

  if (!nom) return null

  return (
    <div
      style={{
        padding: 12,
        marginBottom: 12,
        border: '1px solid #ddd',
        borderRadius: 8,
      }}
    >
      👤 {nom}{' '}
     /mobile {
    localStorage.clear()
  }}
>
  Changer d'utilisateur
</Link>
    </div>
  )
}
