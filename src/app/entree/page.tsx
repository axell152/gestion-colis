'use client'

import { useState } from 'react'
import { entrerColis } from '@/lib/colis-actions'

// TODO: remplacer 'demo-user' par l'ID de l'utilisateur connecté une fois NextAuth branché
const UTILISATEUR_ID_TEMPORAIRE = 'demo-user'

export default function EntreePage() {
  const [form, setForm] = useState({ reference: '', numeroColis: '', emplacement: '', quantite: 1 })
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; texte: string } | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    try {
      await entrerColis({
  ...form,
  utilisateurId: UTILISATEUR_ID_TEMPORAIRE,
})

if (!result.success) {
  setMessage({
    type: 'error',
    texte: result.message,
  })
  return
}
      setMessage({ type: 'ok', texte: `Colis ${form.numeroColis} enregistré en stock.` })
      setForm({ reference: '', numeroColis: '', emplacement: '', quantite: 1 })
    } catch (err: any) {
      setMessage({ type: 'error', texte: err.message })
    }
  }

  return (
    <main style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20 }}>Entrée en stock</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        <input
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value })}
          placeholder="Référence (ex: EPPO426E)"
          style={{ padding: 12, fontSize: 16 }}
          required
        />
        <input
          value={form.numeroColis}
          onChange={(e) => setForm({ ...form, numeroColis: e.target.value })}
          placeholder="Numéro de colis"
          style={{ padding: 12, fontSize: 16 }}
          required
        />
        <input
          value={form.emplacement}
          onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
          placeholder="Emplacement"
          style={{ padding: 12, fontSize: 16 }}
          required
        />
        <input
          type="number"
          min={1}
          value={form.quantite}
          onChange={(e) => setForm({ ...form, quantite: Number(e.target.value) })}
          placeholder="Quantité"
          style={{ padding: 12, fontSize: 16 }}
          required
        />
        <button type="submit" style={{ padding: 14, fontSize: 16 }}>
          Enregistrer l'entrée
        </button>
      </form>
      {message && (
        <p style={{ marginTop: 16, color: message.type === 'ok' ? 'green' : '#b00' }}>{message.texte}</p>
      )}
    </main>
  )
}
