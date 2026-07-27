'use client'

import { useState, useTransition } from 'react'
import { enregistrerComptage } from '@/lib/inventaire-actions'

const champClass =
  'w-20 px-2 py-2 text-base text-center rounded-lg border border-[#D9D2C4] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

type Ligne = {
  id: string
  code: string
  libelle: string
  emplacement: string | null
  service: string | null
  quantiteComptee: number | null
  quantiteDispo: number | null
}

export default function LigneComptage({ ligne }: { ligne: Ligne }) {
  const [comptee, setComptee] = useState<string>(ligne.quantiteComptee?.toString() ?? '')
  const [dispo, setDispo] = useState<string>(ligne.quantiteDispo?.toString() ?? '')
  const [isPending, startTransition] = useTransition()

  const nComptee = comptee === '' ? null : Number(comptee)
  const nDispo = dispo === '' ? null : Number(dispo)
  const difference = nComptee !== null && nDispo !== null ? nComptee - nDispo : null

  const sauvegarder = (nouvelleComptee: string, nouvelleDispo: string) => {
    startTransition(() => {
      enregistrerComptage({
        ligneId: ligne.id,
        quantiteComptee: nouvelleComptee === '' ? null : Number(nouvelleComptee),
        quantiteDispo: nouvelleDispo === '' ? null : Number(nouvelleDispo),
      })
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
      <td className="px-3 py-2 text-sm font-medium">{ligne.code}</td>
      <td className="px-3 py-2 text-sm">{ligne.libelle}</td>
      <td className="px-3 py-2 text-sm text-[#ADA695]">{ligne.emplacement}</td>
      <td className="px-3 py-2 text-sm text-[#ADA695]">{ligne.service}</td>
      <td className="px-2 py-2">
        <input
          type="number"
          inputMode="numeric"
          value={comptee}
          onChange={(e) => setComptee(e.target.value)}
          onBlur={(e) => sauvegarder(e.target.value, dispo)}
          className={champClass}
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          inputMode="numeric"
          value={dispo}
          onChange={(e) => setDispo(e.target.value)}
          onBlur={(e) => sauvegarder(comptee, e.target.value)}
          className={champClass}
        />
      </td>
      <td className={`px-3 py-2 text-sm text-center ${differenceClass}`}>
        {difference !== null ? difference : '—'}
      </td>
    </tr>
  )
}
