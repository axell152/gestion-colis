'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ajouterLigneManuelle } from '@/lib/inventaire-actions'

const champClass =
  'flex-1 px-3 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20 uppercase'

const boutonClass =
  'px-4 py-3 text-base font-semibold rounded-xl bg-[#1A1A1A] text-white active:scale-[0.98] disabled:opacity-50'

export default function AjouterLigneManuelle() {
  const [code, setCode] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAjouter = () => {
    if (!code.trim()) return
    setErreur(null)
    startTransition(async () => {
      try {
        await ajouterLigneManuelle(code)
        setCode('')
        router.refresh()
        inputRef.current?.focus()
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Erreur inconnue')
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Code référence (ex: DV8248)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAjouter()
          }}
          className={champClass}
        />
        <button onClick={handleAjouter} disabled={isPending} className={boutonClass}>
          {isPending ? '...' : 'Ajouter'}
        </button>
      </div>
      {erreur && <p className="text-sm text-[#C00000] font-medium">{erreur}</p>}
    </div>
  )
}
