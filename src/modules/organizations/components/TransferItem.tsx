interface Props {
  playerName: string
  fromClub: string
  toClub: string
  timeAgo?: string
}

export function TransferItem({ playerName, fromClub, toClub, timeAgo = 'now' }: Props) {
  return (
    <div className="flex items-center gap-md p-sm hover:bg-surface-container-high rounded transition-all group">
      <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-primary font-bold">{playerName.split(' ').map(n => n[0]).slice(0,2).join('')}</div>
      <div className="flex-1 min-w-0">
        <p className="font-title-md text-body-md truncate">{playerName}</p>
        <p className="text-label-sm text-outline truncate">{fromClub} → {toClub}</p>
      </div>
      <div className="text-right">
        <p className="font-data-tabular text-primary">Conf.</p>
        <p className="text-[10px] text-outline">{timeAgo}</p>
      </div>
    </div>
  )
}

export default TransferItem
