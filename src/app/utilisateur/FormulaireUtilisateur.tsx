'use client'

import { useState } from 'react'
import { creerUtilisateur } from '@/lib/colis-actions'

export default function FormulaireUtilisateur() {
  const [name, setName] = useState('')
  const [role, setRole] = useState<'PREPARATEUR' | 'BUREAU'>(
    'PREPARATEUR'
  )

  async function onSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    await creerUtilisateur({
      name,
      role,
    })

    setName('')
    window.location.reload()
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        marginTop: 24,
        display: 'flex',
        gap: 12,
        alignItems: 'center',
      }}
    >
      <input
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        placeholder="Nom"
        required
      />

      <select
        value={role}
        onChange={(e) =>
          setRole(
            e.target.value as
              | 'PREPARATEUR'
              | 'BUREAU'
          )
        }
      >
        <option value="PREPARATEUR">
          PREPARATEUR
        </option>

        <option value="BUREAU">
          BUREAU
        </option>
      </select>

      <button type="submit">
        Créer
      </button>
    </form>
  )
}
