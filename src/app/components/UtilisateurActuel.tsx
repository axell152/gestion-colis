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
    <div className="flex items-center justify-between px-4 py-3 mb-4 bg-white border border-[#EAE4D9] rounded-xl">
      <span className="text-[#1A1A1A]">👤 {nom}</span>

      <Link
        href="/mobile"
        onClick={() => {
          localStorage.removeItem('utilisateurId')
          localStorage.removeItem('utilisateurNom')
          localStorage.removeItem('role')
        }}
        className="text-sm text-[#E8703A] underline"
      >
        Changer d'utilisateur
      </Link>
    </div>
  )
}
