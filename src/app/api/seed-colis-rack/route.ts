import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import colisRack from '../../../../prisma/colis-rack.json'

// Route à usage unique : visite /api/seed-colis-rack?secret=... une seule fois
// pour importer les 169 colis actuellement sur rack (fichier Excel legacy
// "COLIS SUR RACK" / ABCD_Gestion_Stock_Optimisee.xlsx, état du 27/07/2026).
// Supprime ce fichier (src/app/api/seed-colis-rack/route.ts) une fois l'import fait.
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const FINITIONS_VALIDES = ['E', 'B', 'N', 'G', 'A']

  let importes = 0
  const erreurs: string[] = []

  for (const c of colisRack as {
    numeroColis: string
    reference: string
    designation: string
    finition: string
    quantite: number
    emplacement: string
    date: string | null
  }[]) {
    if (!FINITIONS_VALIDES.includes(c.finition)) {
      erreurs.push(`${c.numeroColis} : finition "${c.finition}" invalide, ignoré.`)
      continue
    }

    try {
      await prisma.colis.upsert({
        where: { numeroColis: c.numeroColis },
        update: {},
        create: {
          numeroColis: c.numeroColis,
          reference: c.reference,
          designation: c.designation,
          finition: c.finition as 'E' | 'B' | 'N' | 'G' | 'A',
          quantite: c.quantite,
          emplacement: c.emplacement,
          statut: 'EN_STOCK',
          createdAt: c.date ? new Date(c.date) : undefined,
        },
      })
      importes++
    } catch (e) {
      erreurs.push(`${c.numeroColis} : erreur technique (${e instanceof Error ? e.message : 'inconnue'})`)
    }
  }

  return NextResponse.json({
    message: `${importes} colis importés sur ${colisRack.length}.`,
    erreurs,
  })
}
