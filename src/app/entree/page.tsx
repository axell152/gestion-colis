'use client'

import { useEffect, useState } from 'react'
import { entrerColis } from '@/lib/colis-actions'
import UtilisateurActuel from '@/app/components/UtilisateurActuel'

const champClass =
  'w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

export default function EntreePage() {
  const [form, setForm] = useState({ reference: '', numeroColis: '', emplacement: '', quantite: '' })
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; texte: string } | null>(null)
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
    
    try {
      const result = await entrerColis({
  ...form,
  quantite: Number(form.quantite),
  utilisateurId,
})
      if (!result.success) {
  setMessage({
    type: 'error',
    texte: result.message ?? 'Erreur inconnue',
  })
  return
}
      setMessage({ type: 'ok', texte: `Colis ${form.numeroColis} enregistré en stock.` })
      setForm({ reference: '', numeroColis: '', emplacement: '', quantite: '' })
    } catch (err: any) {
      setMessage({ type: 'error', texte: err.message })
    }
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <UtilisateurActuel />
      <h1 className="text-xl font-semibold text-[#1A1A1A]">Entrée en stock</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 mt-4">
        <input
          value={form.reference}
          onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })}
          placeholder="Référence (ex: EPPO426E)"
          className={champClass}
          required
        />
        <input
          value={form.numeroColis}
          onChange={(e) => setForm({ ...form, numeroColis: e.target.value.toUpperCase() })}
          placeholder="Numéro de colis (ex: E001)"
          className={champClass}
          required
        />
        <input
          value={form.emplacement}
          onChange={(e) => setForm({ ...form, emplacement: e.target.value.toUpperCase() })}
          placeholder="Emplacement (ex: R10)"
          className={champClass}
          required
        />
        <input
          type="number"
          min={1}
          value={form.quantite}
          onChange={(e) => setForm({ ...form, quantite: e.target.value })}
          placeholder="Quantité (ex: 80)"
          className={champClass}
          required
        />
        <button
          type="submit"
          className="py-3.5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition"
        >
          Enregistrer l'entrée
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${message.type === 'ok' ? 'text-green-700' : 'text-red-700'}`}>{message.texte}</p>
      )}
    </main>
  )
}
