'use client'

import { useEffect, useState } from 'react'
import { deplacerColis } from '@/lib/colis-actions'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'

export default function DeplacementPage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [nouvelEmplacement, setNouvelEmplacement] = useState('')
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
  
  async function onDeplacement(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (!utilisateurId) {
  setMessage({
    type: 'error',
    texte: 'Veuillez sélectionner un utilisateur sur /mobile',
  })
  return
}
    
    const result = await deplacerColis({
      numeroColis,
      nouvelEmplacement,
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
      texte: `Colis ${numeroColis} déplacé vers ${nouvelEmplacement}.`,
    })

    setNumeroColis('')
    setNouvelEmplacement('')
  }

  return (
    <main style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <UtilisateurActuel />
      <h1 style={{ fontSize: 20 }}>Déplacement de colis</h1>

      <form
        onSubmit={onDeplacement}
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
          style={{
            padding: 12,
            fontSize: 16,
            textTransform: 'uppercase',
          }}
          required
        />

        <input
          value={nouvelEmplacement}
          onChange={(e) =>
            setNouvelEmplacement(e.target.value.toUpperCase())
          }
          placeholder="Nouvel emplacement"
          style={{
            padding: 12,
            fontSize: 16,
            textTransform: 'uppercase',
          }}
          required
        />

        <button type="submit" style={{ padding: 14, fontSize: 16 }}>
          Déplacer le colis
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
