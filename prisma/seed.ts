import { PrismaClient } from '@prisma/client'
import references from './references.json'

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
