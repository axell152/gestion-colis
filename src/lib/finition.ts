export const FINITIONS = {
  E: 'Brut',
  B: 'Blanc',
  G: 'Gris',
  A: 'Anodisé',
  N: 'Noir',
} as const

export type FinitionCode = keyof typeof FINITIONS

/**
 * Déduit le code de finition à partir de la référence.
 * - Dernière lettre connue : "EPPO426E" -> "E" (Brut), "EPL4029B" -> "B" (Blanc)
 * - Référence finissant par un chiffre = produit brut : "EPTRANU4" -> "E" (Brut)
 */
export function deduireFinition(reference: string): FinitionCode {
  const ref = reference.trim().toUpperCase()
  const dernierCaractere = ref.slice(-1)

  // Produits bruts sans lettre de finition (ex: EPTRANU4, EPTRANU2)
  if (/\d/.test(dernierCaractere)) {
    return 'E'
  }

  if (dernierCaractere in FINITIONS) {
    return dernierCaractere as FinitionCode
  }
  throw new Error(
    `Impossible de déduire la finition pour la référence "${reference}" (lettre finale "${dernierCaractere}" inconnue)`
  )
}

export function libelleFinition(code: FinitionCode): string {
  return FINITIONS[code]
}
