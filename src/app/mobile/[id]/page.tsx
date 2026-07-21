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

    router.push('/entree')
  }, [params.id, router])

  return (
    <main style={{ padding: 24 }}>
      Connexion...
    </main>
  )
}
