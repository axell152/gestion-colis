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

  // Trouver la position du premier chiffre
  let premierChiffre = -1
  for (let pos = 0; pos < c.length; pos++) {
    if (c[pos] >= '0' && c[pos] <= '9') {
      premierChiffre = pos
      break
    }
  }

  // Pas de chiffres = produit standalone
  if (premierChiffre === -1) {
    return c
  }

  // Extraire le bloc de chiffres consécutifs
  let blocChiffres = ''
  for (let pos = premierChiffre; pos < c.length; pos++) {
    if (c[pos] >= '0' && c[pos] <= '9') {
      blocChiffres += c[pos]
    } else {
      break
    }
  }

  const posApresBloc = premierChiffre + blocChiffres.length

  // Les 2 derniers chiffres sont-ils une taille connue ?
  const taille = blocChiffres.slice(-2)
  const estUneTaille = TAILLES_CONNUES.includes(taille)

  if (!estUneTaille) {
    // Pas une taille connue -> produit distinct
    return c
  }

  // C'est une taille : récupérer la lettre de finition juste après le bloc
  let finition = ''
  if (posApresBloc < c.length) {
    const charApres = c[posApresBloc]
    if (charApres >= 'A' && charApres <= 'Z') {
      finition = charApres
    }
  }

  const prefixeLettre = c.slice(0, premierChiffre)
  const chiffresAvantTaille = blocChiffres.length > 2 ? blocChiffres.slice(0, -2) : ''

  return prefixeLettre + chiffresAvantTaille + finition
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
