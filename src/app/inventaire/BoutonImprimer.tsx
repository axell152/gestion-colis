'use client'

const boutonClass =
  'px-4 py-3 text-base font-semibold rounded-xl border border-[#1A1A1A] text-[#1A1A1A] active:scale-[0.98] print:hidden'

export default function BoutonImprimer() {
  return (
    <button onClick={() => window.print()} className={boutonClass}>
      🖨️ Imprimer la feuille
    </button>
  )
}
