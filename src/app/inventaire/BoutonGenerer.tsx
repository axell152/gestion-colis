'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { genererInventaire } from '@/lib/inventaire-actions'

const boutonClass =
  'w-full px-4 py-3 text-base font-semibold rounded-xl bg-[#005B9E] text-white active:scale-[0.98] disabled:opacity-50'

export default function BoutonGenerer({ dejaUnInventaire }: { dejaUnInventaire: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = () => {
    if (dejaUnInventaire) {
      const confirme = window.confirm(
        "Avez-vous bien fini l'inventaire précédent et enregistré ses résultats ?"
      )
      if (!confirme) return
    }

    setErreur(null)
    startTransition(async () => {
      try {
        await genererInventaire()
        router.refresh()
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Erreur inconnue')
      }
    })
  }

  return (
    <div className="space-y-2">
      <button onClick={handleClick} disabled={isPending} className={boutonClass}>
        {isPending ? 'Génération...' : "Générer l'inventaire du jour"}
      </button>
      {erreur && <p className="text-sm text-[#C00000] font-medium">{erreur}</p>}
    </div>
  )
}
