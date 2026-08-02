# Diagnóstico MatchCenter — Gaps, Melhorias e Roadmap

> Análise baseada na estrutura de arquivos do repositório  
> Data: Agosto 2026

---

## 1. Inventário de arquivos MatchCenter

### Arquivos identificados

| Caminho | Responsabilidade |
|---|---|
| `src/modules/competitions/pages/MatchCenterPage.tsx` | Página principal do match center |
| `src/modules/competitions/pages/MatchDetailPage.tsx` | Detalhe do jogo |
| `src/modules/competitions/pages/MatchReportPage.tsx` | Relatório pós-jogo |
| `src/modules/competitions/pages/MatchLineupPage.tsx` | Escalação |
| `src/modules/competitions/hooks/useMatchCenter.ts` | Hook orquestrador |
| `src/modules/competitions/hooks/useMatchLive.ts` | Hook de jogo ao vivo |
| `src/modules/competitions/hooks/useMatchEvents.ts` | Hook de eventos (gols, cartões) |
| `src/modules/competitions/hooks/useMatchLineup.ts` | Hook de escalação |
| `src/modules/competitions/hooks/useMatchStats.ts` | Hook de estatísticas |
| `src/modules/competitions/hooks/useMatchReport.ts` | Hook de relatório |
| `src/modules/competitions/services/match.api.ts` | API de jogos |
| `src/modules/competitions/components/MatchCard.tsx` | Card de jogo |
| `src/modules/competitions/components/MatchScoreboard.tsx` | Placar |
| `src/modules/competitions/components/MatchTimeline.tsx` | Timeline de eventos |
| `src/modules/competitions/components/MatchEventsPanel.tsx` | Painel de eventos |
| `src/modules/competitions/components/MatchEventForm.tsx` | Formulário de eventos |
| `src/modules/competitions/components/MatchStatsPanel.tsx` | Estatísticas |
| `src/modules/competitions/components/MatchLineupGrid.tsx` | Grid de escalação |
| `src/modules/competitions/components/MatchRefereeReport.tsx` | Relatório do árbitro |
| `src/modules/competitions/components/MatchStatusBadge.tsx` | Badge de status |
| `src/modules/competitions/components/MatchCountdown.tsx` | Contagem regressiva |

---

## 2. Gaps Críticos Identificados

### 2.1 Escalação Pública — Bloqueios de Renderização

**Problema central:** A `MatchLineupPage.tsx` provavelmente está dentro de rotas protegidas (`ProtectedRoute`), impedindo que torcedores e visitantes vejam as escalações sem autenticação.

**Gaps específicos:**

- **Rota não pública:** As rotas em `src/app/routes/slices/contentRoutes.tsx` precisam ter uma bifurcação entre rotas autenticadas e rotas de conteúdo público. Escalações pré-jogo são conteúdo público por natureza.
- **Ausência de `PublicLayout` para MatchCenter:** O `PublicLayout.tsx` existe mas provavelmente não está sendo aplicado nas páginas de detalhe de partida.
- **`useMatchLineup.ts` possivelmente depende de auth context:** Se o hook chama `api-client` com interceptors de autenticação, chamadas anônimas falharão silenciosamente.
- **Escalação condicional:** Se a escalação só é liberada N minutos antes do jogo (regra de negócio), não há evidência de um componente de "escalação bloqueada / aguardando liberação" — o resultado provável é tela em branco ou erro não tratado.

**Ação necessária:**
```
contentRoutes.tsx
  └── /matches/:id          → MatchDetailPage (público)
  └── /matches/:id/lineup   → MatchLineupPage (público, com guard de horário)
  └── /matches/:id/report   → MatchReportPage (protegido — árbitro/admin)
```

---

### 2.2 Jogo Ao Vivo — Gaps de Inicialização

**Problema central:** O `useMatchLive.ts` existe mas há gaps no fluxo de inicialização que provavelmente impedem o modo ao vivo de ser ativado corretamente.

**Gaps específicos:**

- **Sem fluxo de "iniciar partida":** Não há evidência de um componente ou página `MatchStartPage` ou modal de confirmação de início. O árbitro ou admin precisa de um CTA claro para mudar o status do jogo de `scheduled` → `live`.
- **Status de transição indefinido:** O `MatchStatusBadge.tsx` provavelmente renderiza badges estáticos. Não há indicação de polling ou WebSocket implementado para propagação de mudança de status em tempo real.
- **`MatchEventForm.tsx` sem guard de status:** O formulário de eventos (gols, cartões, substituições) provavelmente não valida se a partida está em status `live` antes de permitir submissão — criando risco de eventos sendo registrados em jogos ainda não iniciados.
- **Ausência de `useNotificationStream` integrado ao MatchCenter:** O `useNotificationStream.ts` existe no módulo de notificações mas não há evidência de que seja usado dentro dos hooks de jogo ao vivo para notificar eventos em tempo real.
- **`MatchCountdown.tsx` sem transição automática:** O componente de contagem regressiva não parece ter lógica para acionar uma transição de UI quando o countdown chega a zero.

**Fluxo esperado (ausente):**
```
[Árbitro/Admin]
  → Acessa MatchDetailPage
  → Clica "Iniciar Partida"
  → Confirmação de status: scheduled → live
  → MatchEventForm liberado
  → Placar e Timeline começam a ser atualizados em tempo real
  → Notificações push enviadas aos seguidores
```

---

### 2.3 Relatório de Árbitro — Fluxo Incompleto

- `MatchReportPage.tsx` e `MatchRefereeReport.tsx` existem, mas não há evidência de validação de permissão granular (somente o árbitro designado àquele jogo pode preencher).
- Sem fluxo de "submissão e lock" — após envio, o relatório deve ser imutável.
- Sem integração com o módulo de suspensões (`CompetitionSuspensionsPage.tsx`) — cartões vermelhos do relatório deveriam gerar automaticamente uma entrada de suspensão.

---

### 2.4 Ausência de Testes no MatchCenter

Cruzando os arquivos de teste existentes:

```
src/tests/modules/competitions/hooks/useCompetitionAccess.test.ts  ✅
src/tests/modules/competitions/pages/competition-management.test.tsx ✅

AUSENTES:
src/tests/modules/competitions/hooks/useMatchLive.test.ts           ❌
src/tests/modules/competitions/hooks/useMatchEvents.test.ts         ❌
src/tests/modules/competitions/hooks/useMatchLineup.test.ts         ❌
src/tests/modules/competitions/components/MatchScoreboard.test.tsx  ❌
src/tests/modules/competitions/components/MatchTimeline.test.tsx    ❌
src/tests/modules/competitions/pages/MatchCenterPage.test.tsx       ❌
```

Os componentes mais críticos do produto (jogo ao vivo, placar, escalação) não têm cobertura de teste.

---

## 3. Melhorias por Área

### 3.1 Experiência do Espectador (Público)

| Melhoria | Impacto | Esforço |
|---|---|---|
| Rota pública para escalação | Alto | Baixo |
| Rota pública para placar ao vivo | Alto | Baixo |
| SEO metadata dinâmico por partida (via `useSeo.ts`) | Médio | Baixo |
| Compartilhamento de escalação (Open Graph cards) | Médio | Médio |
| Placar embeddable (iframe público) | Alto | Alto |

### 3.2 Experiência do Árbitro / Admin

| Melhoria | Impacto | Esforço |
|---|---|---|
| Botão "Iniciar Partida" com confirmação | Crítico | Baixo |
| Guard de status no `MatchEventForm` | Crítico | Baixo |
| Timer de jogo com minuto ao vivo | Alto | Médio |
| Lock automático de relatório após submissão | Alto | Médio |
| Integração cartão vermelho → suspensão | Alto | Alto |

### 3.3 Tempo Real

| Melhoria | Impacto | Esforço |
|---|---|---|
| Polling ou SSE no `useMatchLive` | Crítico | Médio |
| Integrar `useNotificationStream` aos eventos de jogo | Alto | Médio |
| Otimistic updates no placar | Médio | Médio |
| Sincronização de múltiplos admins no mesmo jogo | Alto | Alto |

### 3.4 Escalação

| Melhoria | Impacto | Esforço |
|---|---|---|
| Estado "escalação não publicada" | Alto | Baixo |
| Timer de liberação automática | Médio | Médio |
| Drag-and-drop para montar escalação (admin) | Médio | Alto |
| Vista tática (campo visual) | Alto | Alto |

---

## 4. Arquitetura Recomendada — MatchCenter

```
MatchCenterPage
├── [Público] MatchScoreboard          ← polling a cada 30s
├── [Público] MatchStatusBadge         ← status em tempo real
├── [Público] MatchCountdown           ← pré-jogo
├── [Público] MatchTimeline            ← eventos após início
├── [Público] MatchLineupGrid          ← liberado N min antes
├── [Público] MatchStatsPanel          ← disponível após início
│
├── [Árbitro] MatchEventForm           ← guard: status === 'live'
├── [Árbitro] MatchRefereeReport       ← guard: status === 'finished'
│
└── [Admin]   Botão "Iniciar Partida"  ← guard: status === 'scheduled'
              Botão "Encerrar Partida" ← guard: status === 'live'
```

---

## 5. Gaps de Permissão — Mapa de Acesso

| Ação | Quem pode | Guard necessário |
|---|---|---|
| Ver placar | Público | Nenhum |
| Ver escalação | Público (após liberação) | Horário |
| Ver relatório | Público (após encerramento) | Status `finished` |
| Iniciar partida | Admin / Árbitro designado | Role + status `scheduled` |
| Registrar evento | Árbitro designado | Role + status `live` |
| Submeter relatório | Árbitro designado | Role + status `finished` |
| Editar escalação | Técnico do clube | Role + status `scheduled` |

O arquivo `src/constants/roles-permissions.ts` precisa ser verificado para garantir que essas permissões granulares estejam modeladas — especialmente a distinção entre "árbitro designado a este jogo" vs. "qualquer árbitro".

---

## 6. Próximos Passos Recomendados

### Sprint imediato (Quick Wins)

1. **Tornar rotas de placar e escalação públicas** — mover `MatchDetailPage` e `MatchLineupPage` para fora do `ProtectedRoute` com `PublicLayout`.
2. **Adicionar botão "Iniciar Partida"** com mutation de status + guard de role.
3. **Guard de status no `MatchEventForm`** — desabilitar/ocultar se `status !== 'live'`.
4. **Estado vazio de escalação** — mostrar mensagem clara quando escalação ainda não foi publicada.

### Médio prazo

5. Implementar polling ou SSE em `useMatchLive.ts`.
6. Integrar `useNotificationStream` para eventos de gol/cartão.
7. Criar testes para os hooks e componentes críticos.
8. Integrar cartão vermelho → módulo de suspensões.

### Longo prazo

9. Vista tática de escalação (campo visual SVG).
10. Placar embeddable para sites externos.
11. Sincronização multi-árbitro com conflict resolution.
12. Push notifications para torcedores (via `NotificationBell`).

---

## 7. README do MatchCenter

O arquivo `src/modules/competitions/README_MATCHCENTER.md` existe — é um bom sinal. Recomenda-se verificar se ele está atualizado com os hooks de jogo ao vivo e se documenta o fluxo de permissões descrito acima.

---

*Diagnóstico gerado com base na análise estrutural do repositório. Recomenda-se validar cada gap abrindo os arquivos correspondentes para confirmar o comportamento atual antes de iniciar as correções.*
