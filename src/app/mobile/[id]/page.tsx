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

window.dispatchEvent(new Event('role-changed'))

    router.push('/entree')
  }, [params.id, router])

  return (
    <main className="min-h-screen bg-[#F5F1EA] flex flex-col items-center justify-center px-6">
      <div className="w-10 h-10 border-4 border-[#EAE4D9] border-t-[#E8703A] rounded-full animate-spin" />
      <p className="mt-4 text-sm text-[#8A8378]">Connexion...</p>
    </main>
  )
}
