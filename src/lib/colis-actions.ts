'use server'

import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import { deduireFinition } from './finition'
import { revalidatePath } from 'next/cache'

// NOTE: `utilisateurId` est passé explicitement pour l'instant en attendant
// le branchement de NextAuth (récupération de l'utilisateur connecté côté session).

export async function rechercherColisParReference(reference: string) {
  return prisma.colis.findMany({
    where: {
      reference: { equals: reference.trim(), mode: 'insensitive' },
      statut: 'EN_STOCK',
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function entrerColis(input: {
  reference: string
  numeroColis: string
  emplacement: string
  quantite: number
  utilisateurId: string
}) {
  const catalogue = await prisma.referenceCatalogue.findUnique({
    where: { code: input.reference.trim() },
  })

  if (!catalogue) {
    return {
      success: false,
      message: `Référence "${input.reference}" introuvable dans le catalogue.`,
    }
  }

  const finition = deduireFinition(input.reference)

  try {
    const colis = await prisma.colis.create({
      data: {
        reference: input.reference.trim(),
        numeroColis: input.numeroColis.trim(),
        designation: catalogue.libelle,
        finition,
        quantite: input.quantite,
        emplacement: input.emplacement.trim(),
        statut: 'EN_STOCK',
        mouvements: {
          create: {
            type: 'ENTREE',
            emplacementApres: input.emplacement.trim(),
            utilisateurId: input.utilisateurId,
          },
        },
      },
    })

    revalidatePath('/historique')
    revalidatePath('/dispatch')

    return {
      success: true,
      colis,
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        success: false,
        message: `Le numéro de colis "${input.numeroColis}" est déjà utilisé.`,
      }
    }

    return {
      success: false,
      message: 'Une erreur est survenue.',
    }
  }
}

export async function sortirColis(input: {
  numeroColis: string
  utilisateurId: string
}) {
  const colis = await prisma.colis.findUnique({
    where: { numeroColis: input.numeroColis.trim() },
  })

  if (!colis) {
    return {
      success: false,
      message: `Le colis "${input.numeroColis}" est introuvable.`,
    }
  }

  if (colis.statut === 'SORTI') {
    return {
      success: false,
      message: `Le colis "${input.numeroColis}" est déjà sorti.`,
    }
  }

  const updated = await prisma.colis.update({
    where: { id: colis.id },
    data: {
      statut: 'SORTI',
      mouvements: {
        create: {
          type: 'SORTIE',
          emplacementAvant: colis.emplacement,
          utilisateurId: input.utilisateurId,
        },
      },
    },
  })

  revalidatePath('/historique')
  revalidatePath('/dispatch')

  return {
    success: true,
    colis: updated,
  }
}

export async function deplacerColis(input: {
  numeroColis: string
  nouvelEmplacement: string
  utilisateurId: string
}) {
  const colis = await prisma.colis.findUnique({ where: { numeroColis: input.numeroColis.trim() } })
  if (!colis) throw new Error(`Colis "${input.numeroColis}" introuvable.`)

  const updated = await prisma.colis.update({
    where: { id: colis.id },
    data: {
      emplacement: input.nouvelEmplacement.trim(),
      mouvements: {
        create: {
          type: 'DEPLACEMENT',
          emplacementAvant: colis.emplacement,
          emplacementApres: input.nouvelEmplacement.trim(),
          utilisateurId: input.utilisateurId,
        },
      },
    },
  })

  revalidatePath('/historique')
  return updated
}
