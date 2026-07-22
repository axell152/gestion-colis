'use client'

import { useState } from 'react'
import { creerUtilisateur } from '@/lib/colis-actions'

export default function FormulaireUtilisateur() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<'PREPARATEUR' | 'BUREAU'>(
    'PREPARATEUR'
  )

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    await creerUtilisateur({
      name,
      role,
    })

    setName('')
    window.location.reload()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 mt-6"
    >
      <input
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Nom"
        className="w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20"
        required
      />

      <select
        value={role}
        onChange={(e) =>
          setRole(
            e.target.value as
              | 'PREPARATEUR'
              | 'BUREAU'
          )
        }
        className="w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20"
      >
        <option value="PREPARATEUR">
          PREPARATEUR
        </option>

        <option value="BUREAU">
          BUREAU
        </option>
      </select>

      <button
        type="submit"
        className="py-3.5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition"
      >
        Créer
      </button>
    </form>
  )
}
