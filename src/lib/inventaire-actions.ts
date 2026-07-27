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

export async function ajouterLigneManuelle(codeSaisi: string) {
  const code = codeSaisi.trim().toUpperCase()

  if (!code) {
    throw new Error('Merci de saisir un code.')
  }

  const reference = await prisma.referenceCatalogue.findUnique({ where: { code } })

  if (!reference) {
    throw new Error(`Référence "${code}" introuvable dans le catalogue.`)
  }

  // Réutilise l'inventaire en cours s'il y en a un, sinon en crée un nouveau
  // (permet de démarrer un inventaire 100% manuel, sans tirage aléatoire).
  let inventaire = await prisma.inventaireTournant.findFirst({
    orderBy: { date: 'desc' },
    include: { lignes: true },
  })

  if (!inventaire) {
    inventaire = await prisma.inventaireTournant.create({
      data: {},
      include: { lignes: true },
    })
  }

  const dejaPresente = inventaire.lignes.some((l) => l.code === code)
  if (dejaPresente) {
    throw new Error(`"${code}" est déjà dans l'inventaire en cours.`)
  }

  await prisma.ligneInventaireTournant.create({
    data: {
      inventaireId: inventaire.id,
      code: reference.code,
      libelle: reference.libelle,
      emplacement: reference.emplacement,
      service: reference.service,
    },
  })

  revalidatePath('/inventaire')
}

export async function nouvelInventaireManuel() {
  const inventaire = await prisma.inventaireTournant.create({ data: {} })
  revalidatePath('/inventaire')
  return inventaire
}

export async function listerUtilisateurs() {
  return prisma.user.findMany({ orderBy: { name: 'asc' } })
}

export async function enregistrerComptage(input: {
  ligneId: string
  quantiteComptee: number | null
  quantiteDispo: number | null
  compteParNom?: string | null
}) {
  await prisma.ligneInventaireTournant.update({
    where: { id: input.ligneId },
    data: {
      quantiteComptee: input.quantiteComptee,
      quantiteDispo: input.quantiteDispo,
      compteParNom: input.compteParNom ?? undefined,
      dateComptage: input.quantiteComptee !== null ? new Date() : null,
    },
  })
  revalidatePath('/inventaire')
}

export async function supprimerLigne(ligneId: string) {
  await prisma.ligneInventaireTournant.delete({ where: { id: ligneId } })
  revalidatePath('/inventaire')
}
