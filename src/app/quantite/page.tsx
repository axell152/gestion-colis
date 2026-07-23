'use client'

import { useEffect, useState } from 'react'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'
import { ajusterQuantite, rechercherColisParNumero } from '@/lib/colis-actions'

const champClass =
  'w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

type ColisTrouve = Awaited<ReturnType<typeof rechercherColisParNumero>>

export default function QuantitePage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [quantite, setQuantite] = useState('')
  const [message, setMessage] = useState<{
    type: 'ok' | 'error'
    texte: string
  } | null>(null)
  const [utilisateurId, setUtilisateurId] = useState('')
  const [colisTrouve, setColisTrouve] = useState<ColisTrouve>(null)
  const [recherche, setRecherche] = useState(false)

  useEffect(() => {
  const id = localStorage.getItem('utilisateurId')

  if (id) {
    setUtilisateurId(id)
  }
}, [])

async function onVerifier() {
  setMessage(null)
  setRecherche(true)

  const colis = await rechercherColisParNumero(numeroColis)

  setRecherche(false)

  if (!colis) {
    setColisTrouve(null)
    setMessage({
      type: 'error',
      texte: `Colis "${numeroColis}" introuvable ou déjà sorti.`,
    })
    return
  }

  setColisTrouve(colis)
}
  
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
        <div className="flex gap-2">
  <input
    value={numeroColis}
    onChange={(e) => {
      setNumeroColis(e.target.value.toUpperCase())
      setColisTrouve(null)
      setMessage(null)
    }}
    placeholder="Numéro de colis (ex: E001)"
    className={champClass}
    required
  />

  <button
    type="button"
    onClick={onVerifier}
    disabled={!numeroColis || recherche}
    className="px-5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition disabled:opacity-40"
  >
    Vérifier
  </button>
</div>

{colisTrouve && (
  <div className="p-4 rounded-xl border border-[#D9D2C4] bg-white">
    <p className="font-semibold text-[#1A1A1A]">
      {colisTrouve.designation}
    </p>

    <p className="text-sm text-[#8A8378] mt-1">
      Référence : {colisTrouve.reference}
    </p>

    <p className="text-sm text-[#8A8378]">
      Quantité actuelle : {colisTrouve.quantite}
    </p>

    <p className="text-sm text-[#8A8378]">
      Zone : {colisTrouve.emplacement}
    </p>
  </div>
)}

        {colisTrouve && (
<>
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
</>
)}
      </form>

      {message && (
        <p className={`mt-4 text-sm ${message.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}>{message.texte}</p>
      )}
    </main>
  )
}
