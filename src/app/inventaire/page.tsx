import { dernierInventaire, historiqueInventaires } from '@/lib/inventaire-actions'
import BoutonGenerer from './BoutonGenerer'
import LigneComptage from './LigneComptage'
import AjouterLigneManuelle from './AjouterLigneManuelle'

export const dynamic = 'force-dynamic'

export default async function InventairePage() {
  const inventaire = await dernierInventaire()
  const historique = await historiqueInventaires()

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A1A]">Inventaire tournant</h1>

      <BoutonGenerer dejaUnInventaire={inventaire !== null} />

      <AjouterLigneManuelle />

      {inventaire && (
        <div className="space-y-2">
          <p className="text-sm text-[#ADA695]">
            Généré le {inventaire.date.toLocaleDateString('fr-FR')} — {inventaire.lignes.length} référence(s)
          </p>
          <div className="overflow-x-auto rounded-xl border border-[#EAE4D9]">
            <table className="w-full">
              <thead className="bg-[#F5F1EA] text-left text-xs uppercase text-[#ADA695]">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Libellé</th>
                  <th className="px-3 py-2">Emplacement</th>
                  <th className="px-3 py-2">Service</th>
                  <th className="px-2 py-2">Q. comptée</th>
                  <th className="px-2 py-2">Q. dispo</th>
                  <th className="px-3 py-2 text-center">Écart</th>
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
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-[#1A1A1A]">Historique des inventaires</h2>
          <ul className="divide-y divide-[#F5F1EA] rounded-xl border border-[#EAE4D9]">
            {historique.slice(1).map((inv) => (
              <li key={inv.id} className="px-3 py-2 text-sm flex justify-between">
                <span>{inv.date.toLocaleDateString('fr-FR')}</span>
                <span className="text-[#ADA695]">{inv.lignes.length} référence(s)</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
