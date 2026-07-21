'use client'

import { useState } from 'react'
import { rechercherColisParReference } from '@/lib/colis-actions'
import { libelleFinition } from '@/lib/finition'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'

export default function RecherchePage() {
  const [reference, setReference] = useState('')
  const [resultats, setResultats] = useState<Awaited<ReturnType<typeof rechercherColisParReference>>>([])
  const [recherche, setRecherche] = useState(false)

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
    setRecherche(true)
    const res = await rechercherColisParReference(reference)
    setResultats(res)
  }

  return (
    <main style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <UtilisateurActuel />
      <h1 style={{ fontSize: 20 }}>Recherche colis en stock</h1>
      <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          placeholder="Référence (ex: EPPO426E)"
          style={{ flex: 1, padding: 12, fontSize: 16 }}
          autoFocus
        />
        <button type="submit" style={{ padding: '12px 16px', fontSize: 16 }}>
          Chercher
        </button>
      </form>

      {recherche && resultats.length === 0 && (
        <p style={{ marginTop: 16, color: '#b00' }}>Aucun colis en stock pour cette référence.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {resultats.map((c) => (
          <li
            key={c.id}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginBottom: 8 }}
          >
            <strong>Colis {c.numeroColis}</strong>
            <div>{c.designation}</div>
            <div>Finition : {libelleFinition(c.finition as any)}</div>
            <div>Emplacement : <strong>{c.emplacement}</strong></div>
            <div>Quantité : {c.quantite}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
