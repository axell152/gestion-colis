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
      <h1 className="text-xl font-semibold text-[#1A1A1A]">Recherche colis en stock</h1>
      <form onSubmit={onSearch} className="flex flex-col gap-3 mt-4">
  <input
    value={reference}
    onChange={(e) => setReference(e.target.value.toUpperCase())}
    placeholder="Référence (ex: EPPO426E)"
    className="w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20"
    autoFocus
  />
  <button
    type="submit"
    className="py-3.5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition"
  >
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
            <strong>Colis {c.numeroColis.toUpperCase()}</strong>
            <div>{c.designation}</div>
            <div>Finition : {libelleFinition(c.finition as any)}</div>
            <div>Emplacement : <strong>{c.emplacement.toUpperCase()}</strong></div>
            <div>Quantité : {c.quantite}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
