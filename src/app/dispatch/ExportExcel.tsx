'use client'

import * as XLSX from 'xlsx'
import { FINITIONS, FinitionCode, libelleFinition } from '@/lib/finition'

type ColisItem = {
  reference: string
  designation: string
  quantite: number
  numeroColis: string
  emplacement: string
  finition: string
}

export default function ExportExcel({ colisEnStock }: { colisEnStock: ColisItem[] }) {
  function exporter() {
    const classeur = XLSX.utils.book_new()

    for (const code of Object.keys(FINITIONS) as FinitionCode[]) {
      const lignes = colisEnStock
        .filter((c) => c.finition === code)
        .map((c) => ({
          Code: c.reference,
          Libellé: c.designation,
          Quantité: c.quantite,
          'N° Colis': c.numeroColis,
          Zone: c.emplacement,
        }))

      const feuille = XLSX.utils.json_to_sheet(lignes)
      XLSX.utils.book_append_sheet(classeur, feuille, libelleFinition(code))
    }

    const date = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(classeur, `dispatch-${date}.xlsx`)
  }

  return (
    <button
      onClick={exporter}
      className="py-3.5 px-6 rounded-xl border border-[#D9D2C4] text-[#1A1A1A] font-semibold text-base active:scale-[0.98] transition"
    >
      📊 Exporter en Excel
    </button>
  )
}
