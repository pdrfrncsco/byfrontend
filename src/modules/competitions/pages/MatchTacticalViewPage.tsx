import React, { useCallback, useEffect, useState } from 'react'
import TacticalField, { TacticalPlayer } from '../components/tactical/TacticalField'
import { useTacticalPositions } from '../hooks/useTacticalPositions'
import { Button } from '@/components/ui'
import { useParams } from 'react-router-dom'

export default function MatchTacticalViewPage() {
  const { matchId } = useParams<{ matchId: string }>()

  // example initial positions (normalized coords)
  const initial: TacticalPlayer[] = [
    { id: 'p1', number: 1, name: 'GK', x: 0.05, y: 0.5 },
    { id: 'p2', number: 4, name: 'CB', x: 0.25, y: 0.3 },
    { id: 'p3', number: 5, name: 'CB', x: 0.25, y: 0.7 },
    { id: 'p4', number: 8, name: 'CM', x: 0.5, y: 0.4 },
    { id: 'p5', number: 10, name: 'ST', x: 0.75, y: 0.5 },
  ]

  const [players, setPlayers] = useState<TacticalPlayer[]>(initial)
  const { loadPositions, savePositions, loading } = useTacticalPositions(matchId ?? '')

  useEffect(() => {
    let mounted = true
    loadPositions().then((p) => {
      if (!mounted) return
      if (p && p.length) setPlayers(p)
    })
    return () => { mounted = false }
  }, [loadPositions])

  const onPositionsChange = useCallback((next: TacticalPlayer[]) => {
    setPlayers(next)
  }, [])

  const handleSave = async () => {
    const res = await savePositions(players)
    if (res?.conflict) {
      // simple conflict resolution: ask user to overwrite or reload remote
      const remotePositions = res.remote?.positions ?? res.remote
      const message = 'Existe uma versão mais recente das posições no servidor. Deseja substituir (Sobrescrever) ou recarregar a versão remota? OK = Sobrescrever, Cancel = Recarregar remoto.'
      const overwrite = window.confirm(message)
      if (overwrite) {
        const forced = await savePositions(players, { force: true })
        if (forced?.success) {
          // saved
        }
      } else {
        if (Array.isArray(remotePositions)) setPlayers(remotePositions)
        toast.success('Posições actualizadas a partir do servidor.')
      }
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Vista tática</h2>
      <p>Arraste os jogadores para reposicionar. Use Guardar para persistir no servidor.</p>

      <div style={{ marginBottom: 12 }}>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'A gravar...' : 'Guardar posições'}
        </Button>
      </div>

      <TacticalField players={players} onPositionsChange={onPositionsChange} />
    </div>
  )
}
