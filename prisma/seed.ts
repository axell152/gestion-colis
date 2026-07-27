import { PrismaClient } from '@prisma/client'
import references from './references.json'
import referencesInventaire from './references-inventaire.json'

const prisma = new PrismaClient()

async function main() {

  console.log(`Import de ${references.length} références...`)

  for (const ref of references as { code: string; libelle: string }[]) {
    await prisma.referenceCatalogue.upsert({
      where: { code: ref.code },
      update: { libelle: ref.libelle },
      create: { code: ref.code, libelle: ref.libelle },
    })
  }

  // Catalogue de l'inventaire tournant (INVENTAIRE TOURNANT GRAVESON.xlsm) :
  // ajoute emplacement + service, sans écraser un libellé déjà importé ailleurs.
  console.log(`Import de ${referencesInventaire.length} références (inventaire tournant)...`)

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
  }

  console.log("Import terminé.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
