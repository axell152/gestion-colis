'use client'

import { useState } from 'react'

const champClass =
  'w-full px-4 py-3 text-base rounded-xl border border-[#D9D2C4] bg-white text-[#1A1A1A] placeholder-[#ADA695] focus:outline-none focus:border-[#E8703A] focus:ring-2 focus:ring-[#E8703A]/20'

export default function ChampCode({ valeurInitiale }: { valeurInitiale: string }) {
  const [valeur, setValeur] = useState(valeurInitiale)

  return (
    <input
      type="text"
      name="code"
      placeholder="Rechercher un code"
      value={valeur}
      onChange={(e) => setValeur(e.target.value.toUpperCase())}
      className={champClass}
    />
  )
}
