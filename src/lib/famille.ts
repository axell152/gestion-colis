// Port de la fonction VBA `ExtrairePreffixe` (INVENTAIRE TOURNANT GRAVESON.xlsm)
// Regroupe les références d'un même produit (tailles + finition) sous une "famille" commune,
// pour éviter de tirer plusieurs tailles du même produit dans un même inventaire tournant.

const TAILLES_CONNUES = ['26', '29', '30', '31', '58']

/**
 * Déduit la "famille" d'une référence.
 * Ex: "CDAO26B" -> famille "CDAOB" (préfixe + chiffres avant la taille + finition)
 * Ex: "BOACH1" -> pas de taille connue -> famille = code lui-même (produit distinct)
 */
export function extrairePrefixe(code: string): string {
  const c = code.trim()

  // Tous les blocs de chiffres consécutifs du code, avec leur position
  const blocs: { pos: number; chiffres: string }[] = []
  for (let pos = 0; pos < c.length; pos++) {
    if (c[pos] >= '0' && c[pos] <= '9') {
      let chiffres = ''
      let fin = pos
      while (fin < c.length && c[fin] >= '0' && c[fin] <= '9') {
        chiffres += c[fin]
        fin++
      }
      blocs.push({ pos, chiffres })
      pos = fin - 1
    }
  }

  // Pas de chiffres = produit standalone
  if (blocs.length === 0) return c

  // Construit la famille à partir d'un bloc dont les 2 derniers chiffres sont la taille
  const familleDepuisBloc = (bloc: { pos: number; chiffres: string }): string => {
    const posApresBloc = bloc.pos + bloc.chiffres.length

    // Lettre de finition juste après le bloc
    let finition = ''
    if (posApresBloc < c.length) {
      const charApres = c[posApresBloc]
      if (charApres >= 'A' && charApres <= 'Z') finition = charApres
    }

    const prefixeLettre = c.slice(0, bloc.pos)
    const chiffresAvantTaille = bloc.chiffres.length > 2 ? bloc.chiffres.slice(0, -2) : ''
    return prefixeLettre + chiffresAvantTaille + finition
  }

  const estUneTaille = (bloc: { chiffres: string }) =>
    TAILLES_CONNUES.includes(bloc.chiffres.slice(-2))

  // Règle d'origine (macro VBA) : on regarde le PREMIER bloc de chiffres
  if (estUneTaille(blocs[0])) return familleDepuisBloc(blocs[0])

  // Correction : certains codes ont des chiffres dans le nom du produit AVANT la taille
  // (ex. EPP3D29A : "3" dans "3D", puis la taille 29). Sans ça, ils étaient traités
  // comme des produits isolés et leurs autres tailles n'étaient jamais regroupées.
  // On essaie alors le DERNIER bloc, uniquement quand le 1er n'était pas une taille.
  const dernier = blocs[blocs.length - 1]
  if (blocs.length > 1 && estUneTaille(dernier)) return familleDepuisBloc(dernier)

  // Pas une taille connue -> produit distinct
  return c
}

/**
 * Déduit la lettre de finition finale d'un code, si présente (ex: "CDAO26B" -> "B").
 * Renvoie "" si le dernier caractère n'est pas une lettre.
 */
export function derniereLettre(code: string): string {
  const c = code.trim()
  const dernier = c.slice(-1).toUpperCase()
  return dernier >= 'A' && dernier <= 'Z' ? dernier : ''
}
