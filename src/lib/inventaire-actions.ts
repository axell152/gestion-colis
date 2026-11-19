'use server'

import { prisma } from './prisma'
import { choisirFamilles } from './tirage-inventaire'
import { revalidatePath } from 'next/cache'

const NB_LIGNES_MAX = 10
const MOIS_ANTI_REPETITION = 6

/**
 * Génère l'inventaire tournant. Port de la macro VBA `GenererInventaire`, avec une différence :
 * la règle des 6 mois est une PRÉFÉRENCE et non plus un blocage.
 *
 * - familles jamais comptées en priorité, puis celles comptées il y a plus de 6 mois
 * - si ça ne suffit pas, on complète avec les familles les plus anciennement comptées
 * => l'inventaire proposé n'est jamais vide, et toutes les références tournent.
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

  // Date du dernier passage de chaque famille
  const passages = await prisma.familleHistorique.groupBy({
    by: ['famille'],
    _max: { date: true },
  })
  const dernierPassage = new Map<string, Date>()
  for (const p of passages) {
    if (p._max.date) dernierPassage.set(p.famille, p._max.date)
  }

  const { lignes, familles, nbRepeteesAvantDelai } = choisirFamilles(
    references,
    dernierPassage,
    { nbLignesMax: NB_LIGNES_MAX, moisAntiRepetition: MOIS_ANTI_REPETITION }
  )

  // Inventaire + historique enregistrés ensemble (tout ou rien)
  const [inventaire] = await prisma.$transaction([
    prisma.inventaireTournant.create({
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
    }),
    prisma.familleHistorique.createMany({
      data: familles.map((famille) => ({ famille })),
    }),
  ])

  revalidatePath('/inventaire')
  return { inventaire, nbRepeteesAvantDelai }
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

export async function definirCompteur(inventaireId: string, nom: string) {
  await prisma.inventaireTournant.update({
    where: { id: inventaireId },
    data: { compteParNom: nom === '' ? null : nom },
  })
  revalidatePath('/inventaire')
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
      dateComptage: input.quantiteComptee !== null ? new Date() : null,
    },
  })
  revalidatePath('/inventaire')
}

export async function rechercherLignesParCode(codeSaisi: string) {
  const code = codeSaisi.trim().toUpperCase()

  if (!code) return []

  return prisma.ligneInventaireTournant.findMany({
    where: { code: { contains: code, mode: 'insensitive' } },
    include: { inventaire: true },
    orderBy: { inventaire: { date: 'desc' } },
  })
}

export async function supprimerLigne(ligneId: string) {
  await prisma.ligneInventaireTournant.delete({ where: { id: ligneId } })
  revalidatePath('/inventaire')
}
