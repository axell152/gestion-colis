export const FINITIONS = {
  E: 'Brut',
  B: 'Blanc',
  G: 'Gris',
  A: 'Anodisé',
  N: 'Noir',
} as const

export type FinitionCode = keyof typeof FINITIONS

/**
 * Déduit le code de finition à partir de la dernière lettre de la référence.
 * Ex: "EPPO426E" -> "E" (Brut), "EPL4029B" -> "B" (Blanc)
 */
export function deduireFinition(reference: string): FinitionCode {
  const derniereLettre = reference.trim().slice(-1).toUpperCase()
  if (derniereLettre in FINITIONS) {
    return derniereLettre as FinitionCode
  }
  throw new Error(
    `Impossible de déduire la finition pour la référence "${reference}" (lettre finale "${derniereLettre}" inconnue)`
  )
}

export function libelleFinition(code: FinitionCode): string {
  return FINITIONS[code]
}
