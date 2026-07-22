'use client'

import { useEffect, useState } from 'react'
import { ajusterQuantite } from '@/lib/colis-actions'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'

const champClass =
  'w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

export default function QuantitePage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [quantite, setQuantite] = useState('')
  const [message, setMessage] = useState<{
    type: 'ok' | 'error'
    texte: string
  } | null>(null)
  const [utilisateurId, setUtilisateurId] = useState('')

  useEffect(() => {
  const id = localStorage.getItem('utilisateurId')

  if (id) {
    setUtilisateurId(id)
  }
}, [])
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (!utilisateurId) {
  setMessage({
    type: 'error',
    texte: 'Veuillez sélectionner un utilisateur sur /mobile',
  })
  return
}
    
    const result = await ajusterQuantite({
      numeroColis,
      quantite: Number(quantite),
      utilisateurId,
    })

    if (!result.success) {
      setMessage({
        type: 'error',
        texte: result.message ?? 'Erreur inconnue',
      })
      return
    }

    setMessage({
      type: 'ok',
      texte: `Quantité du colis ${numeroColis} mise à jour.`,
    })

    setNumeroColis('')
    setQuantite('')
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <UtilisateurActuel />
      <h1 className="text-xl font-semibold text-[#1A1A1A]">Ajustement de quantité</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-4">
        <input
          value={numeroColis}
          onChange={(e) => setNumeroColis(e.target.value.toUpperCase())}
          placeholder="Numéro de colis (ex: E001)"
          className={champClass}
          required
        />

        <input
          type="number"
          min={0}
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          placeholder="Nouvelle quantité (ex: 80)"
          className={champClass}
          required
        />

        <button
          type="submit"
          className="py-3.5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition"
        >
          Mettre à jour la quantité
        </button>
      </form>

      {message && (
        <p className={`mt-4 text-sm ${message.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}>{message.texte}</p>
      )}
    </main>
  )
}
