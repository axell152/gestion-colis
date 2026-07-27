'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { definirCompteur } from '@/lib/inventaire-actions'

const selectClass =
  'px-3 py-2 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

export default function SelectionneurCompteur({
  inventaireId,
  compteurActuel,
  utilisateurs,
}: {
  inventaireId: string
  compteurActuel: string | null
  utilisateurs: { id: string; name: string }[]
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-[#ADA695]">Compté par :</label>
      <select
        defaultValue={compteurActuel ?? ''}
        disabled={isPending}
        onChange={(e) => {
          startTransition(async () => {
            await definirCompteur(inventaireId, e.target.value)
            router.refresh()
          })
        }}
        className={selectClass}
      >
        <option value="">— Choisir —</option>
        {utilisateurs.map((u) => (
          <option key={u.id} value={u.name}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  )
}
