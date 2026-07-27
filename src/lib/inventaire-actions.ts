'use server'

import { prisma } from './prisma'
import { extrairePrefixe, derniereLettre } from './famille'
import { revalidatePath } from 'next/cache'

const NB_LIGNES_MAX = 10
const MOIS_ANTI_REPETITION = 6

/**
 * Port de la macro VBA `GenererInventaire` :
 * - tire des familles de références au hasard
 * - exclut les familles déjà comptées dans les X derniers mois
 * - ajoute toutes les tailles/déclinaisons de la famille tirée (même finition)
 * - s'arrête à NB_LIGNES_MAX lignes
 */
export async function genererInventaire() {
  const references = await prisma.referenceCatalogue.findMany({
    where: { emplacement: { not: null } },
  })

  if (references.length === 0) {
    throw new Error(
      "Aucune référence avec emplacement en base. As-tu bien importé le catalogue de l'inventaire tournant ?"
    )
  }

  const seuilAntiRepetition = new Date()
  seuilAntiRepetition.setMonth(seuilAntiRepetition.getMonth() - MOIS_ANTI_REPETITION)

  const historiqueRecent = await prisma.familleHistorique.findMany({
    where: { date: { gte: seuilAntiRepetition } },
  })
  const famillesRecentes = new Set(historiqueRecent.map((h) => h.famille))

  // Mélange (Fisher-Yates)
  const pool = [...references]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const famillesAjoutees = new Set<string>()
  const lignes: {
    code: string
    libelle: string
    emplacement: string | null
    service: string | null
  }[] = []

  for (const ref of pool) {
    if (lignes.length >= NB_LIGNES_MAX) break

    const famille = extrairePrefixe(ref.code)

    if (famillesAjoutees.has(famille)) continue
    if (famillesRecentes.has(famille)) continue

    famillesAjoutees.add(famille)
    const finition = derniereLettre(ref.code)

    // Toutes les déclinaisons de cette famille, même finition
    const declinaisons = references.filter(
      (autre) => extrairePrefixe(autre.code) === famille && derniereLettre(autre.code) === finition
    )

    for (const decl of declinaisons) {
      if (lignes.length >= NB_LIGNES_MAX) break
      lignes.push({
        code: decl.code,
        libelle: decl.libelle,
        emplacement: decl.emplacement,
        service: decl.service,
      })
    }

    await prisma.familleHistorique.create({ data: { famille } })
  }

  const inventaire = await prisma.inventaireTournant.create({
    data: {
      lignes: {
        create: lignes.map((l) => ({
          code: l.code,
          libelle: l.libelle,
          emplacement: l.emplacement,
          service: l.service,
        })),
      },
    },
    include: { lignes: true },
  })

  revalidatePath('/inventaire')
  return inventaire
}

export async function dernierInventaire() {
  return prisma.inventaireTournant.findFirst({
    orderBy: { date: 'desc' },
    include: { lignes: true },
  })
}

export async function historiqueInventaires() {
  return prisma.inventaireTournant.findMany({
    orderBy: { date: 'desc' },
    include: { lignes: true },
  })
}

export async function enregistrerComptage(input: {
  ligneId: string
  quantiteComptee: number | null
  quantiteDispo: number | null
}) {
  await prisma.ligneInventaireTournant.update({
    where: { id: input.ligneId },
    data: {
      quantiteComptee: input.quantiteComptee,
      quantiteDispo: input.quantiteDispo,
    },
  })
  revalidatePath('/inventaire')
}
