'use client'

import { useEffect, useState } from 'react'
import { sortirColis, } from '@/lib/colis-actions'

export default function SortiePage() {
  const [numeroColis, setNumeroColis] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; texte: string } | null>(null)
  const [utilisateurId, setUtilisateurId] = useState('')

  async function onSortie(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    useEffect(() => {
  const id = localStorage.getItem('utilisateurId')

  if (id) {
    setUtilisateurId(id)
  }
}, [])
    
    try {
  const result = await sortirColis({
    numeroColis,
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
    texte: `Colis ${numeroColis} sorti du stock.`,
  })

  setNumeroColis('')
} catch (err: any) {
  setMessage({
    type: 'error',
    texte: err.message,
  })
}
  }

  return (
    <main style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20 }}>Sortie de stock</h1>

      <input
        value={numeroColis}
        onChange={(e) => setNumeroColis(e.target.value)}
        placeholder="Numéro de colis"
        style={{ padding: 12, fontSize: 16, width: '100%', marginTop: 12, boxSizing: 'border-box', textTransform: 'uppercase' }}
      />

      <form onSubmit={onSortie} style={{ marginTop: 16 }}>
        <button type="submit" style={{ padding: 14, fontSize: 16, width: '100%' }}>
          Sortir ce colis du stock
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 16, color: message.type === 'ok' ? 'green' : '#b00' }}>{message.texte}</p>
      )}
    </main>
  )
}
