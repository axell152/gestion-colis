'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { rechercherLignesParCode } from '@/lib/inventaire-actions'

const champClass =
  'flex-1 px-3 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

const boutonClass =
  'px-4 py-3 text-base font-semibold rounded-xl bg-[#1A1A1A] text-white active:scale-[0.98] disabled:opacity-50'

type Resultat = {
  id: string
  code: string
  libelle: string
  emplacement: string | null
  service: string | null
  quantiteComptee: number | null
  quantiteDispo: number | null
  dateComptage: Date | null
  inventaire: { id: string; date: Date; compteParNom: string | null }
}

export default function RechercheProduit() {
  const [code, setCode] = useState('')
  const [resultats, setResultats] = useState<Resultat[] | null>(null)
  const [isPending, startTransition] = useTransition()

  const chercher = () => {
    if (!code.trim()) return
    startTransition(async () => {
      const res = await rechercherLignesParCode(code)
      setResultats(res as Resultat[])
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Rechercher un code dans les inventaires (ex: DV8248)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key === 'Enter') chercher()
          }}
          className={champClass}
        />
        <button onClick={chercher} disabled={isPending} className={boutonClass}>
          {isPending ? '...' : 'Chercher'}
        </button>
      </div>

      {resultats !== null && (
        <div className="space-y-2">
          {resultats.length === 0 ? (
            <p className="text-sm text-[#ADA695]">Aucun résultat pour ce code.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#EAE4D9]">
              <table className="w-full">
                <thead className="bg-[#F5F1EA] text-left text-xs uppercase text-[#ADA695]">
                  <tr>
                    <th className="px-3 py-2">Date inventaire</th>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Libellé</th>
                    <th className="px-2 py-2">Q. comptée</th>
                    <th className="px-2 py-2">Q. dispo</th>
                    <th className="px-3 py-2 text-center">Écart</th>
                    <th className="px-3 py-2">Compté par</th>
                  </tr>
                </thead>
                <tbody>
                  {resultats.map((r) => {
                    const difference =
                      r.quantiteComptee !== null && r.quantiteDispo !== null
                        ? r.quantiteComptee - r.quantiteDispo
                        : null
                    const differenceClass =
                      difference === null
                        ? 'text-[#ADA695]'
                        : difference < 0
                          ? 'text-[#C00000] font-bold'
                          : difference > 0
                            ? 'text-[#0046C8] font-bold'
                            : 'text-[#1A1A1A] font-semibold'

                    return (
                      <tr key={r.id} className="border-b border-[#F5F1EA]">
                        <td className="px-3 py-2 text-sm whitespace-nowrap">
                          <Link
                            href={`/inventaire/historique/${r.inventaire.id}`}
                            className="text-[#E8703A] hover:underline"
                          >
                            {r.inventaire.date.toLocaleDateString('fr-FR')}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-sm font-medium whitespace-nowrap">{r.code}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">{r.libelle}</td>
                        <td className="px-2 py-2 text-sm text-center">{r.quantiteComptee ?? '—'}</td>
                        <td className="px-2 py-2 text-sm text-center">{r.quantiteDispo ?? '—'}</td>
                        <td className={`px-3 py-2 text-sm text-center ${differenceClass}`}>
                          {difference !== null ? difference : '—'}
                        </td>
                        <td className="px-3 py-2 text-sm text-[#ADA695] whitespace-nowrap">
                          {r.inventaire.compteParNom ?? '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
