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
  E: 'FF2E7D32', // Brut → vert
  B: 'FFED7D31', // Blanc → orange
  G: 'FFC00000', // Gris → rouge
  A: 'FFFFC000', // Anodisé → jaune
  N: 'FF005B9E', // Noir → bleu
}

const TEXTE_BLANC: FinitionCode[] = ['E', 'B', 'G', 'N']
const COULEUR_ENTETE = 'FF005B9E'

async function chargerImage(url: string) {
  const reponse = await fetch(url)
  return reponse.arrayBuffer()
}

export default function ExportExcel({ colisEnStock }: { colisEnStock: ColisItem[] }) {
  async function exporter() {
    const classeur = new ExcelJS.Workbook()

    const [logoBuffer, illustrationBuffer] = await Promise.all([
      chargerImage('/logo-abcd.png'),
      chargerImage('/illustration-rack.png'),
    ])

    const logoId = classeur.addImage({ buffer: logoBuffer, extension: 'png' })
    const illustrationId = classeur.addImage({ buffer: illustrationBuffer, extension: 'png' })

    for (const code of Object.keys(FINITIONS) as FinitionCode[]) {
      const couleur = COULEURS_FINITION[code]
      const texteBlanc = TEXTE_BLANC.includes(code)

      const feuille = classeur.addWorksheet(libelleFinition(code), {
        properties: { tabColor: { argb: couleur } },
      })

      // Bannière (lignes 1-2) — réduite pour correspondre à la taille des images
      feuille.getRow(1).height = 32
      feuille.getRow(2).height = 32

      feuille.mergeCells('A1:A2')
      feuille.mergeCells('B1:D2')
      feuille.mergeCells('E1:E2')

      for (let ligne = 1; ligne <= 2; ligne++) {
        for (let colonne = 2; colonne <= 4; colonne++) {
          feuille.getCell(ligne, colonne).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: couleur },
          }
        }
      }

      const titre = feuille.getCell('B1')
      titre.value = `Liste colis en stock  |  ${libelleFinition(code).toUpperCase()}`
      titre.font = {
        bold: true,
        size: 13,
        color: { argb: texteBlanc ? 'FFFFFFFF' : 'FF000000' },
      }
      titre.alignment = { vertical: 'middle', horizontal: 'center' }

      feuille.getColumn(1).width = 22
      feuille.getColumn(5).width = 14

      feuille.addImage(logoId, {
        tl: { col: 0.25, row: 0.15 },
        ext: { width: 150, height: 66 },
      })

      feuille.addImage(illustrationId, {
        tl: { col: 4.3, row: 0.15 },
        ext: { width: 80, height: 66 },
      })

      // En-têtes (ligne 3) — toujours en bleu, quelle que soit la finition
      const entetes = ['Code', 'Libellé', 'Quantité', 'N° Colis', 'Zone']
      const ligneEntete = feuille.getRow(3)

      entetes.forEach((libelle, index) => {
        const cellule = ligneEntete.getCell(index + 1)
        cellule.value = libelle
        cellule.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cellule.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COULEUR_ENTETE } }
        cellule.alignment = { horizontal: 'center', vertical: 'middle' }
      })

      // Données (à partir de la ligne 4)
      const lignes = colisEnStock
        .filter((c) => c.finition === code)
        .map((c) => [c.reference, c.designation, c.quantite, c.numeroColis, c.emplacement])

     lignes.forEach((ligne) => {
        const rangee = feuille.addRow(ligne)
        rangee.eachCell((cellule) => {
          cellule.alignment = { horizontal: 'center', vertical: 'middle' }
        })
      })

      // Largeur des colonnes ajustée au contenu
      const largeurs = entetes.map((h) => h.length)

      lignes.forEach((ligne) => {
        ligne.forEach((valeur, index) => {
          const longueur = String(valeur).length
          if (longueur > largeurs[index]) largeurs[index] = longueur
        })
      })

      largeurs.forEach((largeur, index) => {
        const colonne = feuille.getColumn(index + 1)
        colonne.width = Math.max(largeur + 3, colonne.width ?? 0)
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
