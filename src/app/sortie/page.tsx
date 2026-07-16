'use client'

import { useState } from 'react'
import { sortirColis, deplacerColis } from '@/lib/colis-actions'

const UTILISATEUR_ID_TEMPORAIRE = 'demo-user'

export default function SortiePage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [nouvelEmplacement, setNouvelEmplacement] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; texte: string } | null>(null)

  async function onSortie(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    try {
      await sortirColis({ numeroColis, utilisateurId: UTILISATEUR_ID_TEMPORAIRE })
      setMessage({ type: 'ok', texte: `Colis ${numeroColis} sorti du stock.` })
      setNumeroColis('')
    } catch (err: any) {
      setMessage({ type: 'error', texte: err.message })
    }
  }

  async function onDeplacement(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    try {
      await deplacerColis({ numeroColis, nouvelEmplacement, utilisateurId: UTILISATEUR_ID_TEMPORAIRE })
      setMessage({ type: 'ok', texte: `Colis ${numeroColis} déplacé vers ${nouvelEmplacement}.` })
      setNumeroColis('')
      setNouvelEmplacement('')
    } catch (err: any) {
      setMessage({ type: 'error', texte: err.message })
    }
  }

  return (
    <main style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20 }}>Sortie / déplacement</h1>

      <input
        value={numeroColis}
        onChange={(e) => setNumeroColis(e.target.value)}
        placeholder="Numéro de colis"
        style={{ padding: 12, fontSize: 16, width: '100%', marginTop: 12, boxSizing: 'border-box' }}
      />

      <form onSubmit={onSortie} style={{ marginTop: 16 }}>
        <button type="submit" style={{ padding: 14, fontSize: 16, width: '100%' }}>
          Sortir ce colis du stock
        </button>
      </form>

      <form onSubmit={onDeplacement} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          value={nouvelEmplacement}
          onChange={(e) => setNouvelEmplacement(e.target.value)}
          placeholder="Nouvel emplacement"
          style={{ padding: 12, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: 14, fontSize: 16 }}>
          Modifier l'emplacement
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: message.type === 'ok' ? 'green' : '#b00' }}>{message.texte}</p>
      )}
    </main>
  )
}
