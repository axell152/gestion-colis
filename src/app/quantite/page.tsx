'use client'

import { useEffect, useState } from 'react'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'
import { ajusterQuantite, rechercherColisParNumero, modifierCodeColis } from '@/lib/colis-actions'

const champClass =
  'w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

type ColisTrouve = Awaited<ReturnType<typeof rechercherColisParNumero>>

export default function QuantitePage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [quantite, setQuantite] = useState('')
  const [nouveauCode, setNouveauCode] = useState('') 
  const [utilisateurRole, setUtilisateurRole] = useState('') 
  const [message, setMessage] = useState<{
    type: 'ok' | 'error'
    texte: string
  } | null>(null)
  const [utilisateurId, setUtilisateurId] = useState('')
  const [colisTrouve, setColisTrouve] = useState<ColisTrouve>(null)
  const [recherche, setRecherche] = useState(false)

  useEffect(() => {
    const id = localStorage.getItem('utilisateurId')
    const role = localStorage.getItem('utilisateurRole') 

    if (id) {
      setUtilisateurId(id)
    }
    if (role) {
      // On met le rôle en minuscules pour éviter les soucis de casse ("BUREAU" vs "bureau")
      setUtilisateurRole(role.toLowerCase())
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
    setNouveauCode(colis.numeroColis ?? '')
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
    
    // Si l'utilisateur est "bureau" et souhaite modifier le code du colis
    if (utilisateurRole === 'bureau' && nouveauCode && colisTrouve && nouveauCode !== colisTrouve.numeroColis) {
      try {
        await modifierCodeColis(colisTrouve.id, nouveauCode, utilisateurRole)
      } catch (err: any) {
        setMessage({ type: 'error', texte: err.message })
        return
      }
    }

    // Ajustement de la quantité classique
    const result = await ajusterQuantite({
      numeroColis: nouveauCode || numeroColis, 
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
      texte: `Mise à jour effectuée avec succès pour le colis ${nouveauCode || numeroColis}.`,
    })

    setNumeroColis('')
    setQuantite('')
    setNouveauCode('')
    setColisTrouve(null)
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <UtilisateurActuel />
      <h1 className="text-xl font-semibold text-[#1A1A1A]">Ajustement du colis</h1>

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
              Code : {colisTrouve.reference}
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
            {/* Zone de saisie JSX pour modifier le code du colis (affichée si le rôle est bureau) */}
            
              <div className="flex flex-col gap-1 mt-2 p-3 bg-orange-50 rounded-xl border border-orange-200">
                <label className="text-xs font-semibold text-orange-800">
                  Modification du code du colis (Réservé au Bureau) :
                </label>
                <input
                  type="text"
                  value={nouveauCode}
                  onChange={(e) => setNouveauCode(e.target.value.toUpperCase())}
                  placeholder="Nouveau code du colis"
                  className={champClass}
                />
              </div>
            

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
              Mettre à jour
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
