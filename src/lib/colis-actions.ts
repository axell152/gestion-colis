'use server'

import { normaliserTexte } from './normalisation'
import { prisma } from './prisma'
import { Prisma } from '@prisma/client'
import { deduireFinition } from './finition'
import { revalidatePath } from 'next/cache'

export async function modifierCodeColis(colisId: string, nouveauNumeroColis: string, utilisateurRole: string) {
  // Vérification stricte du rôle "bureau"
  if (utilisateurRole !== "bureau") {
    throw new Error("Action non autorisée : seuls les utilisateurs du bureau peuvent modifier le code d'un colis.");
  }

  const numeroNormalise = normaliserTexte(nouveauNumeroColis)

  if (!numeroNormalise) {
    throw new Error("Le nouveau code ne peut pas être vide.");
  }

  try {
    const colisMisAJour = await prisma.colis.update({
      where: { id: colisId },
      data: { numeroColis: numeroNormalise }, // Utilisation correcte du champ numeroColis
    });

    revalidatePath('/quantite');
    revalidatePath('/historique');
    return { success: true, colis: colisMisAJour };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new Error(`Le code "${nouveauNumeroColis}" est déjà utilisé par un autre colis.`);
    }
    console.error("Erreur lors de la modification du code du colis :", error);
    throw new Error("Impossible de modifier le code du colis.");
  }
}

export async function creerUtilisateur(input: {
  name: string
  role: 'PREPARATEUR' | 'BUREAU'
}) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: `${Date.now()}@local.test`,
      role: input.role,
    },
  })
}

export async function rechercherColisParReference(reference: string) {
  return prisma.colis.findMany({
    where: {
      reference: { equals: normaliserTexte(reference), mode: 'insensitive' },
      statut: 'EN_STOCK',
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function rechercherColisParNumero(numeroColis: string) {
  const numero = normaliserTexte(numeroColis)

  const colis = await prisma.colis.findUnique({
    where: { numeroColis: numero },
  })

  if (!colis || colis.statut === 'SORTI') {
    return null
  }

  return colis
}

export async function entrerColis(input: {
  reference: string
  numeroColis: string
  emplacement: string
  quantite: number
  utilisateurId: string
}) {
  const reference = normaliserTexte(input.reference)
  const numeroColis = normaliserTexte(input.numeroColis)

  const catalogue = await prisma.referenceCatalogue.findUnique({
    where: { code: reference },
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
        reference,
        numeroColis,
        designation: catalogue.libelle,
        finition,
        quantite: input.quantite,
        emplacement: input.emplacement.trim().toUpperCase(),
        statut: 'EN_STOCK',
        mouvements: {
          create: {
            type: 'ENTREE',
            emplacementApres: input.emplacement.trim().toUpperCase(),
            quantiteApres: input.quantite,
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
  const numeroColis = normaliserTexte(input.numeroColis)
  const colis = await prisma.colis.findUnique({
    where: { numeroColis },
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
  const numeroColis = normaliserTexte(input.numeroColis)
  const colis = await prisma.colis.findUnique({
    where: { numeroColis }, 
  })
  if (!colis) {
    return {
      success: false,
      message: `Le colis "${input.numeroColis}" est introuvable.`,
    }
  }

  const updated = await prisma.colis.update({
    where: { id: colis.id },
    data: {
      emplacement: input.nouvelEmplacement.trim().toUpperCase(),
      mouvements: {
        create: {
          type: 'DEPLACEMENT',
          emplacementAvant: colis.emplacement,
          emplacementApres: input.nouvelEmplacement.trim().toUpperCase(),
          utilisateurId: input.utilisateurId,
        },
      },
    },
  })

  revalidatePath('/historique')
  return {
    success: true,
    colis: updated,
  }
}

export async function ajusterQuantite(input: {
  numeroColis: string
  quantite: number
  utilisateurId: string
}) {
  const numeroColis = normaliserTexte(input.numeroColis)

  const colis = await prisma.colis.findUnique({
    where: { numeroColis },
  })

  if (!colis) {
    return {
      success: false,
      message: `Le colis "${numeroColis}" est introuvable.`,
    }
  }

  const updated = await prisma.colis.update({
    where: { id: colis.id },
    data: {
      quantite: input.quantite,
      mouvements: {
        create: {
          type: 'AJUSTEMENT',
          utilisateurId: input.utilisateurId,
          quantiteAvant: colis.quantite,
          quantiteApres: input.quantite,
        },
      },
    },
  })

  revalidatePath('/historique')

  return {
    success: true,
    colis: updated,
  }
}
