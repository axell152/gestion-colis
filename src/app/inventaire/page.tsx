import Link from 'next/link'
import { dernierInventaire, historiqueInventaires, listerUtilisateurs } from '@/lib/inventaire-actions'
import BoutonGenerer from './BoutonGenerer'
import LigneComptage from './LigneComptage'
import AjouterLigneManuelle from './AjouterLigneManuelle'
import BoutonImprimer from './BoutonImprimer'
import SelectionneurCompteur from './SelectionneurCompteur'
import RechercheProduit from './RechercheProduit'

export const dynamic = 'force-dynamic'

export default async function InventairePage() {
  const inventaire = await dernierInventaire()
  const historique = await historiqueInventaires()
  const utilisateurs = await listerUtilisateurs()

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A] print:hidden">Inventaire tournant</h1>

      {/* Titre + compteur visibles uniquement sur la feuille imprimée */}
      {inventaire && (
        <div className="hidden print:block">
          <h1 className="text-2xl font-bold">INVENTAIRE TOURNANT</h1>
          <p className="text-sm">
            Compté par : {inventaire.compteParNom ?? '_______________'} — {inventaire.date.toLocaleDateString('fr-FR')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <BoutonGenerer dejaUnInventaire={inventaire !== null} />
        {inventaire && <BoutonImprimer />}
      </div>

      {inventaire && (
        <div className="print:hidden">
          <SelectionneurCompteur
            inventaireId={inventaire.id}
            compteurActuel={inventaire.compteParNom}
            utilisateurs={utilisateurs}
          />
        </div>
      )}

      <div className="print:hidden">
        <AjouterLigneManuelle />
      </div>

      {inventaire && (
        <div className="space-y-2">
          <p className="text-sm text-[#ADA695] print:hidden">
            Généré le {inventaire.date.toLocaleDateString('fr-FR')} — {inventaire.lignes.length} référence(s)
          </p>
          <div className="overflow-x-auto rounded-xl border border-[#EAE4D9] print:border-none print:overflow-visible">
            <table className="w-full">
              <thead className="bg-[#F5F1EA] text-left text-xs uppercase text-[#ADA695] print:bg-transparent">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Libellé</th>
                  <th className="px-3 py-2">Emplacement</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-2 py-2">Q. comptée</th>
                  <th className="px-2 py-2 print:hidden">Q. dispo</th>
                  <th className="px-3 py-2 text-center print:hidden">Écart</th>
                  <th className="px-3 py-2 print:hidden">Date</th>
                  <th className="px-2 py-2 print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {inventaire.lignes.map((ligne) => (
                  <LigneComptage key={ligne.id} ligne={ligne} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {historique.length > 1 && (
        <div className="space-y-2 print:hidden">
          <h2 className="text-base font-semibold text-[#1A1A1A]">Historique des inventaires</h2>
          <ul className="divide-y divide-[#F5F1EA] rounded-xl border border-[#EAE4D9]">
            {historique.slice(1).map((inv) => (
              <li key={inv.id} className="px-3 py-2 text-sm">
                <Link
                  href={`/inventaire/historique/${inv.id}`}
                  className="flex justify-between hover:text-[#005B9E]"
                >
                  <span>{inv.date.toLocaleDateString('fr-FR')}</span>
                  <span className="text-[#ADA695]">{inv.lignes.length} référence(s)</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2 print:hidden">
        <h2 className="text-base font-semibold text-[#1A1A1A]">Rechercher un produit compté</h2>
        <RechercheProduit />
      </div>
    </main>
  )
}
