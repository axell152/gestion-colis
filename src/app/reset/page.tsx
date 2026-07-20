'use client'

import { viderHistorique } from '@/lib/colis-actions'

export default function ResetPage() {
  return (
    <button onClick={() => viderHistorique()}>
      Vider l'historique
    </button>
  )
}
