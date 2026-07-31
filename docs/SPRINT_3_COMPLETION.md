# Sprint 3 — Escalações + Relatório (Concluída)

**Data:** 2026-07-29  
**Status:** ✅ **CONCLUÍDA**

---

## O que foi auditado

### 1. ✅ MatchLineupPage.tsx com Drag & Drop

**Status:** Já implementado com HTML5 Drag & Drop API

- Drag & drop de jogadores entre titulares/suplentes
- Validação de escalação (11 titulares, GK obrigatório, max 7 suplentes)
- Workflow: Rascunho → Submetido → Bloqueado
- Indicadores de elegibilidade (verde/âmbar/vermelho)

**Hook:** `useMatchLineup.ts` — 100% implementado

### 2. ✅ MatchReportPage.tsx com Workflow

**Status:** Já implementado com workflow árbitro

- Formulário multi-secção (informações, incidentes, observações)
- Upload de documento oficial (PDF)
- Workflow: Rascunho → Submetido → Aprovado
- Role-based access (árbitro para submeter, admin/federation para aprovar)

**Hook:** `useMatchReport.ts` — 100% implementado

### 3. ✅ Notificações (sonner)

**Status:** Já integrado via `toast.success/error()`

- Notificação ao submeter escalação
- Notificação ao submeter relatório
- Notificação ao aprovar relatório
- Notificação ao adicionar/remover evento

### 4. ✅ RBAC (Role-Based Access Control)

**Status:** Parcialmente implementado

**Hook:** `useCompetitionAccess`
```typescript
{
  isAdmin: boolean  // true para owner, admin, competition_organizer
}
```

**Permissões nos hooks:**
- `useMatchReport`: `canSubmit` (referee), `canApprove` (admin/federation)
- `useMatchEvents`: Admin pode adicionar/remover eventos
- `useMatchLineup`: Admin pode submeter/bloquear

---

## Estado Final

| Componente | Hook | Status |
|------------|------|--------|
| MatchLineupPage | useMatchLineup | ✅ 100% |
| MatchReportPage | useMatchReport | ✅ 100% |
| Notificações | - | ✅ Integradas |
| RBAC | useCompetitionAccess | ✅ 80% |

---

## Documentação

- `frontend/docs/SPRINT_3_COMPLETION.md` — Este documento

---

*Sprint concluída em 2026-07-29 | BolaYetu Platform*










Ok. Agora, depois o submeter a escalação, o frontend não renderiza a       
  escalação submetida no matchid. Vamos rever e corrigir                     

  Vou analisar o fluxo de submissão e renderização da escalação. Preciso     
  verificar:

  1. O que a API retorna após a submissão
  2. Como o frontend busca e renderiza a escalação submetida
● Read frontend/src/modules/clubs/pages/ClubMatchLineupManagerPage.tsx       
  (L269-298)
● Grep "existingLineup|startingXI|substitutes|getLineup"
    ╰ output_mode=content,
    path=frontend/src/modules/clubs/pages/ClubMatchLineupManagerPage.tsx     
  13 matches in 1 file (showing first results)
● Glob "frontend/src/modules/competitions/services/match.api*"
  1 file
    services\match.api.ts
● Read frontend/src/modules/competitions/services/match.api.ts

  Vejo o problema. A função mapLineupFromBackend espera data.lineup_players, 
  mas o backend retorna starters e substitutes. Vou verificar o que o        
  serializer retorna:
● Read backend/competitions/serializers/lineup_serializers.py (L134-158)     

  O backend retorna starters e substitutes, mas o frontend espera
  lineup_players. Vou corrigir o mapLineupFromBackend:
● Write
  D:\ndeascloud\boayetu\frontend\src\modules\competitions\services\match.api.
  ts
  added 14 lines, removed 3 lines at L123 in
  D:\ndeascloud\boayetu\frontend\src\modules\competitions\services\match.api.
  ts
   123   // Helper function to map Lineup from backend
   124   export function mapLineupFromBackend(data: any): MatchLineup {      
   125     if (!data) return data
   126
   127-    const players = (data.lineup_players ||
      []).map(mapLineupPlayerFromBackend)
   128-    const startingXI = players.filter((p: any) => p.status ===        
   12-    const substitutes = players.filter((p: any) => p.status ===        
     'substitute')
   127+    // Backend may return either lineup_players, or
      starters/substitutes directly
   128+    let startingXI: LineupPlayer[] = []
   129+    let substitutes: LineupPlayer[] = []
   130
   131+    if (data.starters && data.substitutes) {
   132+      // New format from LineupSubmissionDetailSerializer
   133+      startingXI = data.starters.map(mapLineupPlayerFromBackend)      
   134+      substitutes = data.substitutes.map(mapLineupPlayerFromBackend)  
   135+    } else if (data.lineup_players) {
   136+      // Legacy format with lineup_players array
   137+      const players =
   138+      startingXI = players.filter((p: any) => p.status === 'starter') 
   139+      substitutes = players.filter((p: any) => p.status ===
   140+    }
   141+
   131     return {
   132       matchId: data.match || '',
   133       teamId: data.club || '',
   134       formation: data.formation || '4-3-3',
   135       startingXI,
   136       substitutes,
   137       coach: data.coach || undefined,
   138       submittedAt: data.submitted_at,
   139       lockedAt: data.locked_at,
   140     }
   141   }

  Agora preciso verificar o mapLineupPlayerFromBackend para garantir que está
  mapeando corretamente os campos do serializer MatchLineupPlayerSerializer: 
● Read frontend/src/modules/competitions/services/match.api.ts (L84-113)     

  O mapeamento parece correto, mas preciso verificar se o serializer do      
  backend está retornando os campos esperados. Vou verificar o
  MatchLineupPlayerSerializer:
● Read backend/competitions/serializers/lineup_serializers.py (L37-66)       

  O serializer retorna player_id e player (com full_name). Agora preciso     
  verificar se há um problema com o mapeamento da posição. O
  PlayerBasicSerializer retorna position que é primary_position do jogador,  
  mas o mapLineupPlayerFromBackend está verificando data.player?.position.   
  Vou verificar:
● Read backend/competitions/serializers/lineup_serializers.py (L26-40)       

  Há um conflito! O PlayerBasicSerializer.position mapeia de
  primary_position, mas o MatchLineupPlayerSerializer também tem um campo    
  position que é a posição no jogo (gk, cb, st, etc). O frontend pode estar  
  confundindo os dois.

  Vou verificar se a lógica de posição no mapLineupPlayerFromBackend está    
  correta:
● Write
  D:\ndeascloud\boayetu\frontend\src\modules\competitions\services\match.api.
  ts
  added 10 lines, removed 5 lines at L92 in
  D:\ndeascloud\boayetu\frontend\src\modules\competitions\services\match.api.
  ts
    92   // Helper function to map LineupPlayer from backend
    93   export function mapLineupPlayerFromBackend(data: any): LineupPlayer 
    94     if (!data) return data
    95
    96+    // Determine position: prefer lineup position over player's       
      primary position
    96     let position: 'GK' | 'DF' | 'MF' | 'FW' = 'MF'
    97-    const posUpper = (data.player?.position || data.position ||       
      '').toUpperCase()
    98-    if (data.is_goalkeeper || posUpper === 'GK' || posUpper ===       
    98+    const posUpper = (data.position || data.player?.position ||       
      '').toUpperCase()
    99+    if (data.is_goalkeeper || posUpper === 'GK' || posUpper === 'GOLO'
       || posUpper.includes('GK')) {
    99       position = 'GK'
   100-    } else if (['DF', 'LD', 'LE', 'CB'].includes(posUpper)) {
   101+    } else if (['CB', 'LB', 'RB', 'DF', 'LWB', 'RWB'].some(k =>       
       posUpper.includes(k))) {
   101       position = 'DF'
   10-    } else if (['MF', 'MC', 'MD', 'ME', 'CM', 'DM',
     'AM'].includes(posUpper)) {
   103+    } else if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'MF'].some(k =>       
       posUpper.includes(k))) {
   103       position = 'MF'
   104-    } else if (['FW', 'PL', 'ST', 'CF', 'LW',
   105+    } else if (['ST', 'CF', 'LW', 'RW', 'FW'].some(k =>
       posUpper.includes(k))) {
   105       position = 'FW'
   106     }
   107
   108     return {
   109       playerId: data.player_id || data.player?.id || '',
   110       playerName: data.player?.full_name || '',
   111       playerNumber: data.shirt_number || 0,
   112       position,
   113       positionSpecific: data.position || undefined,
   114       eligible: data.eligible !== undefined ? data.eligible : true,   
   115       eligibilityWarning: data.eligibility_warning || undefined,      
   116       avatarUrl: data.player?.avatar || undefined,
   118+      is_goalkeeper: data.is_goalkeeper || position === 'GK',
   119+      is_captain: data.is_captain || false,
   120+      shirt_number: data.shirt_number,
   121+      status: data.status,
   117
   118       // Legacy fields
   119       ...data,
   120     }
   121   }

  Agora preciso verificar o endpoint de get lineup. O getLineup usa
  /competitions/matches/${matchId}/lineups/${teamId}/, mas o backend pode ter
  uma rota diferente. Vou verificar as URLs:
● Grep "lineups.*<str:|lineups/(?P"
    ╰ output_mode=content, path=backend/competitions
    The tool arguments failed validation: Invalid regex
    'lineups.*<str:|lineups/(?P': regex parse error:
        (?:lineups.*<str:|lineups/(?P)
                                    ^
    error: unrecognized flag
