'use client'

import { useEffect, useState } from 'react'
import { ajusterQuantite } from '@/lib/colis-actions'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'

export default function QuantitePage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [quantite, setQuantite] = useState(1)
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
      quantite,
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
    setQuantite(1)
  }

  return (
    <main style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <UtilisateurActuel />
      <h1 style={{ fontSize: 20 }}>Ajustement de quantité</h1>

      <form
        onSubmit={onSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginTop: 12,
        }}
      >
        <input
          value={numeroColis}
          onChange={(e) => setNumeroColis(e.target.value.toUpperCase())}
          placeholder="Numéro de colis"
          style={{ padding: 12, fontSize: 16 }}
          required
        />

        <input
          type="number"
          min={0}
          value={quantite}
          onChange={(e) => setQuantite(Number(e.target.value))}
          placeholder="Nouvelle quantité"
          style={{ padding: 12, fontSize: 16 }}
          required
        />

        <button type="submit" style={{ padding: 14, fontSize: 16 }}>
          Mettre à jour la quantité
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: 16,
            color: message.type === 'ok' ? 'green' : '#b00',
          }}
        >
          {message.texte}
        </p>
      )}
    </main>
  )
}
