'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Menu() {
  const [role, setRole] = useState('')

  useEffect(() => {
    const r = localStorage.getItem('role')

    if (r) {
      setRole(r)
    }
  }, [])

  return (
    <nav>
      /entreeEntrée📥</Link>
      {' | '}
      cherche">Recherche🔍</Link>
      {' | '}
      /sortieSortie📤</Link>
      {' | '}
      /deplacementDéplacement📦</Link>
      {' | '}
      /quantiteAjustement🔢</Link>

      {role === 'BUREAU' && (
        <>
          {' | '}
          /historiqueHistorique📜</Link>

          {' | '}
          /dispatchDispatch📊</Link>

          {' | '}
          /utilisateursUtilisateurs👥</Link>
        </>
      )}
    </nav>
  )
}
