'use client'

import { useState } from 'react'

export default function RechercheForm({
  finitionSelectionnee,
  codeInitial,
}: {
  finitionSelectionnee: string
  codeInitial: string
}) {
  const [code, setCode] = useState(codeInitial)

  return (
    <div className="max-w-sm mt-6 mx-auto">
      <form className="flex flex-col gap-3">
        <input type="hidden" name="finition" value={finitionSelectionnee} />
        <input
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Rechercher un code"
          className="w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20"
        />
        <button
          type="submit"
          className="py-3.5 rounded-xl bg-[#E8703A] text-white font-semibold text-base shadow-sm active:scale-[0.98] transition"
        >
          Rechercher
        </button>
      </form>
    </div>
  )
}
