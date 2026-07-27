'use client'

import { useState, useTransition } from 'react'
import { enregistrerComptage, supprimerLigne } from '@/lib/inventaire-actions'

const champClass =
  'w-20 px-2 py-2 text-base text-center rounded-lg border border-[#D9D2C4] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

const selectClass =
  'px-2 py-2 text-sm rounded-lg border border-[#D9D2C4] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

type Ligne = {
  id: string
  code: string
  libelle: string
  emplacement: string | null
  service: string | null
  quantiteComptee: number | null
  quantiteDispo: number | null
  compteParNom: string | null
  dateComptage: Date | null
}

export default function LigneComptage({
  ligne,
  utilisateurs,
}: {
  ligne: Ligne
  utilisateurs: { id: string; name: string }[]
}) {
  const [comptee, setComptee] = useState<string>(ligne.quantiteComptee?.toString() ?? '')
  const [dispo, setDispo] = useState<string>(ligne.quantiteDispo?.toString() ?? '')
  const [compteur, setCompteur] = useState<string>(ligne.compteParNom ?? '')
  const [isPending, startTransition] = useTransition()

  const nComptee = comptee === '' ? null : Number(comptee)
  const nDispo = dispo === '' ? null : Number(dispo)
  const difference = nComptee !== null && nDispo !== null ? nComptee - nDispo : null

  const sauvegarder = (nouvelleComptee: string, nouvelleDispo: string, nouveauCompteur: string) => {
    startTransition(() => {
      enregistrerComptage({
        ligneId: ligne.id,
        quantiteComptee: nouvelleComptee === '' ? null : Number(nouvelleComptee),
        quantiteDispo: nouvelleDispo === '' ? null : Number(nouvelleDispo),
        compteParNom: nouveauCompteur === '' ? null : nouveauCompteur,
      })
    })
  }

  const supprimer = () => {
    if (!window.confirm(`Retirer "${ligne.code}" de l'inventaire ?`)) return
    startTransition(() => {
      supprimerLigne(ligne.id)
    })
  }

  const differenceClass =
    difference === null
      ? 'text-[#ADA695]'
      : difference < 0
        ? 'text-[#C00000] font-bold'
        : difference > 0
          ? 'text-[#0046C8] font-bold'
          : 'text-[#1A1A1A] font-semibold'

  return (
    <tr className="border-b border-[#F5F1EA]">
      <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{ligne.code}</td>
      <td className="px-3 py-2 text-sm whitespace-nowrap">{ligne.libelle}</td>
      <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap">{ligne.emplacement}</td>
      <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap">{ligne.service}</td>

      {/* Q. comptée : champ de saisie à l'écran, ligne vierge à l'impression */}
      <td className="px-2 py-2 print:hidden">
        <input
          type="number"
          inputMode="numeric"
          value={comptee}
          onChange={(e) => setComptee(e.target.value)}
          onBlur={(e) => sauvegarder(e.target.value, dispo, compteur)}
          className={champClass}
        />
      </td>
      <td className="hidden px-2 py-2 print:table-cell">
        <span className="inline-block w-16 border-b border-black">&nbsp;</span>
      </td>

      {/* Q. dispo et écart : inutiles sur la feuille imprimée pour le prep */}
      <td className="px-2 py-2 print:hidden">
        <input
          type="number"
          inputMode="numeric"
          value={dispo}
          onChange={(e) => setDispo(e.target.value)}
          onBlur={(e) => sauvegarder(comptee, e.target.value, compteur)}
          className={champClass}
        />
      </td>
      <td className={`px-3 py-2 text-sm text-center print:hidden ${differenceClass}`}>
        {difference !== null ? difference : '—'}
      </td>

      {/* Compté par : choix manuel de la personne qui a fait le comptage */}
      <td className="px-2 py-2 print:hidden">
        <select
          value={compteur}
          disabled={isPending}
          onChange={(e) => {
            const valeur = e.target.value
            setCompteur(valeur)
            sauvegarder(comptee, dispo, valeur)
          }}
          className={selectClass}
        >
          <option value="">—</option>
          {utilisateurs.map((u) => (
            <option key={u.id} value={u.name}>
              {u.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap print:hidden">
        {ligne.dateComptage ? new Date(ligne.dateComptage).toLocaleString('fr-FR') : '—'}
      </td>

      <td className="px-2 py-2 print:hidden">
        <button
          onClick={supprimer}
          disabled={isPending}
          aria-label="Supprimer cette ligne"
          className="text-[#ADA695] hover:text-[#C00000] disabled:opacity-50"
        >
          🗑
        </button>
      </td>
    </tr>
  )
}
