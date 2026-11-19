import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import referencesGraveson from '../../../../prisma/references-inventaire.json'
import referencesSaintPriest from '../../../../prisma/references-inventaire-saint-priest.json'

// Route à usage unique : visite /api/seed-inventaire?secret=... une seule fois
// pour importer les références (emplacement + service) de l'inventaire tournant.
// Le catalogue importé dépend de la variable d'environnement SITE_INVENTAIRE :
//   SITE_INVENTAIRE=saint-priest -> catalogue Saint-Priest
//   (absente ou autre valeur)    -> catalogue Graveson (comportement d'origine)
// Supprime ce fichier (src/app/api/seed-inventaire/route.ts) une fois l'import fait.
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const site = process.env.SITE_INVENTAIRE === 'saint-priest' ? 'saint-priest' : 'graveson'
  const source = site === 'saint-priest' ? referencesSaintPriest : referencesGraveson

  const liste = source as {
    code: string
    libelle: string
    emplacement: string
    service: string
  }[]

  let count = 0
  for (const ref of liste) {
    await prisma.referenceCatalogue.upsert({
      where: { code: ref.code },
      update: { emplacement: ref.emplacement, service: ref.service },
      create: {
        code: ref.code,
        libelle: ref.libelle,
        emplacement: ref.emplacement,
        service: ref.service,
      },
    })
    count++
  }

  // Les références qui ne sont plus dans la liste (ex. ancien catalogue d'un autre site)
  // ne sont plus tirées dans l'inventaire : on vide leur emplacement/service,
  // sans les supprimer (elles restent utiles pour les désignations des colis).
  // Uniquement sur demande : ajouter &nettoyer=1 à l'adresse
  const nettoyer = request.nextUrl.searchParams.get('nettoyer') === '1'
  const retirees = nettoyer
    ? await prisma.referenceCatalogue.updateMany({
        where: {
          code: { notIn: liste.map((r) => r.code) },
          emplacement: { not: null },
        },
        data: { emplacement: null, service: null },
      })
    : { count: 0 }

  return NextResponse.json({
    message: `Catalogue ${site} : ${count} références importées, ${retirees.count} retirée(s) de l'inventaire tournant.`,
  })
}
