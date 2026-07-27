import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import referencesInventaire from '../../../../prisma/references-inventaire.json'

// Route à usage unique : visite /api/seed-inventaire?secret=... une seule fois
// pour importer les 943 références (emplacement + service) de l'inventaire tournant.
// Supprime ce fichier (src/app/api/seed-inventaire/route.ts) une fois l'import fait.
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let count = 0
  for (const ref of referencesInventaire as {
    code: string
    libelle: string
    emplacement: string
    service: string
  }[]) {
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

  return NextResponse.json({ message: `${count} références importées.` })
}
