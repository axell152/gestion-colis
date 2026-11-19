import { extrairePrefixe } from './famille'

export type OptionsTirage = {
  /** Nombre de lignes visé par inventaire (une famille n'est jamais coupée en deux). */
  nbLignesMax: number
  /** Délai "idéal" avant qu'une famille puisse être recomptée. */
  moisAntiRepetition: number
  maintenant?: Date
  random?: () => number
}

export type ResultatTirage<T> = {
  lignes: T[]
  /** Familles réellement tirées (à enregistrer dans l'historique). */
  familles: string[]
  /** Nombre de familles tirées alors qu'elles avaient déjà été comptées il y a moins de X mois. */
  nbRepeteesAvantDelai: number
}

function melanger<T>(tableau: T[], random: () => number): T[] {
  const copie = [...tableau]
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie
}

/**
 * Choisit les familles à compter, sans jamais bloquer.
 *
 * Ordre de priorité :
 *  1. familles jamais comptées (au hasard)
 *  2. familles comptées il y a plus de `moisAntiRepetition` mois (au hasard)
 *  3. si ça ne suffit pas : familles les plus anciennement comptées d'abord
 *     (la règle des 6 mois devient une préférence, plus un blocage)
 *
 * Tant qu'il existe au moins une référence, le résultat n'est jamais vide.
 */
export function choisirFamilles<T extends { code: string }>(
  references: T[],
  dernierPassage: Map<string, Date>,
  options: OptionsTirage
): ResultatTirage<T> {
  const { nbLignesMax, moisAntiRepetition } = options
  const random = options.random ?? Math.random
  const maintenant = options.maintenant ?? new Date()

  const seuil = new Date(maintenant)
  seuil.setMonth(seuil.getMonth() - moisAntiRepetition)

  // Regroupe toutes les déclinaisons d'une même famille (toutes tailles).
  // On ne filtre PAS sur la dernière lettre : la finition est déjà dans la clé de famille,
  // et filtrer dessus laissait certaines déclinaisons (ex. RPMR30BPL) jamais comptées.
  const parFamille = new Map<string, T[]>()
  for (const ref of references) {
    const famille = extrairePrefixe(ref.code)
    const groupe = parFamille.get(famille)
    if (groupe) groupe.push(ref)
    else parFamille.set(famille, [ref])
  }

  const jamais: string[] = []
  const anciennes: string[] = []
  const recentes: string[] = []
  for (const famille of parFamille.keys()) {
    const dernier = dernierPassage.get(famille)
    if (!dernier) jamais.push(famille)
    else if (dernier < seuil) anciennes.push(famille)
    else recentes.push(famille)
  }

  recentes.sort(
    (a, b) => dernierPassage.get(a)!.getTime() - dernierPassage.get(b)!.getTime()
  )

  const ordre = [...melanger(jamais, random), ...melanger(anciennes, random), ...recentes]
  const nbPreferees = jamais.length + anciennes.length

  const lignes: T[] = []
  const familles: string[] = []
  let nbRepeteesAvantDelai = 0

  for (let i = 0; i < ordre.length; i++) {
    if (lignes.length >= nbLignesMax) break

    const famille = ordre[i]
    const declinaisons = parFamille.get(famille)!

    // Une famille n'est jamais coupée : si elle ne rentre pas, on essaie la suivante.
    // Exception : le 1er tirage est toujours accepté, pour ne jamais renvoyer une liste vide.
    if (lignes.length > 0 && lignes.length + declinaisons.length > nbLignesMax) continue

    lignes.push(...declinaisons)
    familles.push(famille)
    if (i >= nbPreferees) nbRepeteesAvantDelai++
  }

  return { lignes, familles, nbRepeteesAvantDelai }
}
