'use client'

import { useEffect, useState } from 'react'
import { sortirColis, rechercherColisParNumero } from '@/lib/colis-actions'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'

const champClass =
  'w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

type ColisTrouve = Awaited<ReturnType<typeof rechercherColisParNumero>>

export default function SortiePage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [colisTrouve, setColisTrouve] = useState<ColisTrouve>(null)
  const [recherche, setRecherche] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; texte: string } | null>(null)
  const [utilisateurId, setUtilisateurId] = useState('')

  useEffect(() => {
    const id = localStorage.getItem('utilisateurId')

    if (id) {
      setUtilisateurId(id)
    }
  }, [])

  function onChangeNumero(valeur: string) {
    setNumeroColis(valeur.toUpperCase())
    setColisTrouve(null)
    setMessage(null)
  }

  async function onVerifier() {
    setMessage(null)
    setRecherche(true)

    const colis = await rechercherColisParNumero(numeroColis)

    setRecherche(false)

    if (!colis) {
      setColisTrouve(null)
      setMessage({ type: 'error', texte: `Colis "${numeroColis}" introuvable ou déjà sorti.` })
      return
    }

    setColisTrouve(colis)
  }

  async function onConfirmer() {
    if (!utilisateurId) {
      setMessage({ type: 'error', texte: 'Veuillez sélectionner un utilisateur sur /mobile' })
      return
    }

    const result = await sortirColis({ numeroColis, utilisateurId })

    if (!result.success) {
      setMessage({ type: 'error', texte: result.message ?? 'Erreur inconnue' })
      return
    }

    setMessage({ type: 'ok', texte: `Colis ${numeroColis} sorti du stock.` })
    setNumeroColis('')
    setColisTrouve(null)
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <UtilisateurActuel />
      <h1 className="text-xl font-semibold text-[#1A1A1A]">Sortie de stock</h1>

      <div className="flex gap-2 mt-4">
        <input
          value={numeroColis}
          onChange={(e) => onChangeNumero(e.target.value)}
          placeholder="Numéro de colis (ex: E001)"
          className={champClass}
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
        <div className="mt-4 p-4 rounded-xl border border-[#D9D2C4] bg-white">
          <p className="font-semibold text-[#1A1A1A]">{colisTrouve.designation}</p>
          <p className="text-sm text-[#8A8378] mt-1">
            Référence : {colisTrouve.reference} · Quantité : {colisTrouve.quantite} · Zone : {colisTrouve.emplacement}
          </p>

          <button
            onClick={onConfirmer}
            className="w-full mt-4 py-3.5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition"
          >
            Confirmer la sortie de ce colis
          </button>
        </div>
      )}

      {message && (
        <p className={`mt-4 text-sm ${message.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}>{message.texte}</p>
      )}
    </main>
  )
}
