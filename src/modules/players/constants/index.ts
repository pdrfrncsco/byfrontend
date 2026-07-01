// Players module — constants

export const POSITION_GROUPS = {
  goalkeeper: [
    { value: 'gk', label: 'GK', fullLabel: 'Goalkeeper' },
  ],
  defence: [
    { value: 'cb', label: 'CB', fullLabel: 'Center Back' },
    { value: 'lb', label: 'LB', fullLabel: 'Left Back' },
    { value: 'rb', label: 'RB', fullLabel: 'Right Back' },
    { value: 'lwb', label: 'LWB', fullLabel: 'Left Wing Back' },
    { value: 'rwb', label: 'RWB', fullLabel: 'Right Wing Back' },
  ],
  midfield: [
    { value: 'cdm', label: 'CDM', fullLabel: 'Defensive Midfielder' },
    { value: 'cm', label: 'CM', fullLabel: 'Central Midfielder' },
    { value: 'cam', label: 'CAM', fullLabel: 'Attacking Midfielder' },
    { value: 'lm', label: 'LM', fullLabel: 'Left Midfielder' },
    { value: 'rm', label: 'RM', fullLabel: 'Right Midfielder' },
    { value: 'lw', label: 'LW', fullLabel: 'Left Winger' },
    { value: 'rw', label: 'RW', fullLabel: 'Right Winger' },
  ],
  attack: [
    { value: 'cf', label: 'CF', fullLabel: 'Center Forward' },
    { value: 'st', label: 'ST', fullLabel: 'Striker' },
  ],
}

export const ALL_POSITIONS = [
  ...POSITION_GROUPS.goalkeeper,
  ...POSITION_GROUPS.defence,
  ...POSITION_GROUPS.midfield,
  ...POSITION_GROUPS.attack,
  { value: 'multiple', label: '—', fullLabel: 'Multiple Positions' },
]

export const POSITION_COLOR: Record<string, string> = {
  gk: '#f59e0b',    // amber
  cb: '#3b82f6',    // blue
  lb: '#3b82f6',
  rb: '#3b82f6',
  lwb: '#3b82f6',
  rwb: '#3b82f6',
  cdm: '#10b981',   // emerald
  cm: '#10b981',
  cam: '#10b981',
  lm: '#10b981',
  rm: '#10b981',
  lw: '#a855f7',    // purple
  rw: '#a855f7',
  cf: '#ef4444',    // red
  st: '#ef4444',
  multiple: '#6b7280', // gray
}

export const STATUS_COLOR: Record<string, string> = {
  active: '#10b981',
  retired: '#6b7280',
  banned: '#ef4444',
  inactive: '#f59e0b',
}
