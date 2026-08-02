import React, { useCallback, useState } from 'react'
import TacticalField, { TacticalPlayer } from '../components/tactical/TacticalField'

export default function MatchTacticalViewPage() {
  // example initial positions (normalized coords)
  const initial: TacticalPlayer[] = [
    { id: 'p1', number: 1, name: 'GK', x: 0.05, y: 0.5 },
    { id: 'p2', number: 4, name: 'CB', x: 0.25, y: 0.3 },
    { id: 'p3', number: 5, name: 'CB', x: 0.25, y: 0.7 },
    { id: 'p4', number: 8, name: 'CM', x: 0.5, y: 0.4 },
    { id: 'p5', number: 10, name: 'ST', x: 0.75, y: 0.5 },
  ]

  const [players, setPlayers] = useState<TacticalPlayer[]>(initial)

  const onPositionsChange = useCallback((next: TacticalPlayer[]) => {
    setPlayers(next)
    // future: persist positions via API
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h2>Vista tática</h2>
      <p>Arraste os jogadores para reposicionar. Export / salvar a integrar depois.</p>
      <TacticalField players={players} onPositionsChange={onPositionsChange} />
    </div>
  )
}
