'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MobileLoginPage({
  params,
}: {
  params: {
    id: string
  }
}) {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem('utilisateurId', params.id)

const nom = new URLSearchParams(
  window.location.search
).get('nom')

if (nom) {
  localStorage.setItem('utilisateurNom', nom)
}

const role = new URLSearchParams(
  window.location.search
).get('role')

if (role) {
  localStorage.setItem('role', role)
}
    
    router.push('/entree')
  }, [params.id, router])

  return (
    <main style={{ padding: 24 }}>
      Connexion...
    </main>
  )
}
