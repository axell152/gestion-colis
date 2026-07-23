'use client'

import ExcelJS from 'exceljs'
import { FINITIONS, FinitionCode, libelleFinition } from '@/lib/finition'

type ColisItem = {
  reference: string
  designation: string
  quantite: number
  numeroColis: string
  emplacement: string
  finition: string
}

const COULEURS_FINITION: Record<FinitionCode, string> = {
  E: 'FFD9A066',
  B: 'FFE5E0D5',
  G: 'FF9CA3AF',
  A: 'FF60A5FA',
  N: 'FF374151',
}

const TEXTE_BLANC: FinitionCode[] = ['N']

export default function ExportExcel({ colisEnStock }: { colisEnStock: ColisItem[] }) {
  async function exporter() {
    const classeur = new ExcelJS.Workbook()

    for (const code of Object.keys(FINITIONS) as FinitionCode[]) {
      const feuille = classeur.addWorksheet(libelleFinition(code), {
        properties: { tabColor: { argb: COULEURS_FINITION[code] } },
      })

      feuille.columns = [
        { header: 'Code', key: 'code' },
        { header: 'Libellé', key: 'libelle' },
        { header: 'Quantité', key: 'quantite' },
        { header: 'N° Colis', key: 'numeroColis' },
        { header: 'Zone', key: 'zone' },
      ]

      const entete = feuille.getRow(1)
      entete.font = {
        bold: true,
        color: { argb: TEXTE_BLANC.includes(code) ? 'FFFFFFFF' : 'FF000000' },
      }
      entete.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COULEURS_FINITION[code] },
      }

      colisEnStock
        .filter((c) => c.finition === code)
        .forEach((c) => {
          feuille.addRow({
            code: c.reference,
            libelle: c.designation,
            quantite: c.quantite,
            numeroColis: c.numeroColis,
            zone: c.emplacement,
          })
        })

      feuille.columns.forEach((colonne) => {
        let largeurMax = String(colonne.header ?? '').length

        colonne.eachCell?.({ includeEmpty: false }, (cellule) => {
          const longueur = cellule.value ? String(cellule.value).length : 0
          if (longueur > largeurMax) largeurMax = longueur
        })

        colonne.width = largeurMax + 3
      })
    }

    const buffer = await classeur.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = URL.createObjectURL(blob)
    const lien = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    lien.href = url
    lien.download = `dispatch-${date}.xlsx`
    lien.click()
    URL.revokeObjectURL(url)
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
