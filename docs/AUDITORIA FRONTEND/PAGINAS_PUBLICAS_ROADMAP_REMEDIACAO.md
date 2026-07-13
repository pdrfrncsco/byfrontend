# Roadmap de Remediação — Páginas Públicas

**Resumo:** 3 achados críticos + 4 secundários. Tempo estimado total: **15-20 dias.**

---

## 1. Matriz de Priorização

```
                          IMPACTO ↑
                          
CRÍTICO (3)               SEO + OG      ← Afeta: Conversão (funil top)
├─ Duplicação Design      ← Afeta: Manutenção, Consistência visual
├─ Zero i18n              ← Afeta: Market reach (PT-BR, EN, ES)
└─ Zero SEO/OG Tags       

ALTO (2)                  Acessibilidade ← Afeta: Legal, Brand reputation
├─ WCAG 2.1 AA tests      ← Afeta: ~15% do mercado (disabilities)
└─ Meta tags dinâmicos    ← Afeta: Social sharing

MÉDIO (3)                 Testes        ← Afeta: Regression risk
├─ Zero cobertura        
├─ Performance (CWV)      ← Afeta: Ranking, UX (conexões lentas)
└─ Formulários auth OK    ← Presume-se OK já

BAIXO (2)                 Page speed    ← Afeta: UX em mobile
├─ Image lazy-load        
└─ Code-splitting         

                          ESFORÇO (dias) →
```

---

## 2. Roadmap de Execução (Sequência Recomendada)

### Semana 1: Unificação Design System

| Dia | Tarefa | Proprietário | Est. | Dependências |
|-----|--------|--|-----|---|
| 1 | Audit completo de CSS em `index.css` — separar por secção (players-*, hero-*, pricing-*) | FE Lead | 4h | — |
| 1 | Criar branch `feat/landing-page-ds-migration` | DevOps | 1h | — |
| 2-3 | Migrar HeroSection.tsx, FeaturesGrid.tsx, Statistics.tsx para Tailwind + DS components | FE1 | 16h | Audit concluído |
| 3-4 | Migrar Pricing.tsx, FAQ.tsx, Testimonials.tsx | FE2 | 16h | Audit concluído |
| 4 | Remover CSS legado de `index.css` (hero-*, pricing-*, faq-*) | FE Lead | 2h | Migrações concluídas |
| 5 | Code review + testes visuais vs. antes | FE Lead | 4h | Migrações concluídas |

**Saída esperada:** LandingPage 100% em Design System Tailwind, zero CSS duplicado para sections de landing.

**Bloqueadores:** Nenhum (é pure refactor).

---

### Semana 2: i18n + SEO Base

| Dia | Tarefa | Proprietário | Est. | Dependências |
|-----|--------|--|-----|---|
| 6 | Expandir i18n de Navigation para PageLayout, LandingPage, componentes públicos | FE1 | 8h | — |
| 6 | Estruturar namespace de chaves i18n (`landing.hero.title`, `landing.pricing.cta`, etc.) | FE Lead | 2h | — |
| 7 | Instalar + configurar react-helmet-async | DevOps | 2h | — |
| 7-8 | Implementar meta tags dinâmicos para Landing, Auth pages (title, description, OG) | FE2 | 12h | react-helmet instalado |
| 8 | Gerar sitemap.xml e robots.txt | DevOps | 2h | — |
| 9 | Validar SEO com Lighthouse CI + Ahrefs crawler test | QA | 3h | Meta tags implementados |

**Saída esperada:** Landing + Auth pages em PT/EN (fallback), Open Graph funcional (preview em LinkedIn/Facebook), `sitemap.xml` em `/sitemap.xml`, `robots.txt` em `/robots.txt`.

**Bloqueadores:** `Navigation.tsx` já tem i18n (check), logo é só expansão.

---

### Semana 3: Acessibilidade + Testes

| Dia | Tarefa | Proprietário | Est. | Dependências |
|-----|--------|--|-----|---|
| 10 | Audit de acessibilidade com Axe DevTools (LandingPage, LoginPage, /players/, /clubs/) | QA | 4h | — |
| 10-11 | Corrigir contrast issues (WCAG AAA onde possível, mínimo AA) | FE1 | 8h | Audit Axe concluído |
| 11-12 | Adicionar ARIA labels, semantic HTML, navegação por teclado | FE2 | 12h | Audit Axe concluído |
| 12 | Teste manual com VoiceOver (Mac) / NVDA (Windows) | QA | 4h | Correções implementadas |
| 13 | Implementar testes visuais (Cypress/Playwright) para páginas públicas | FE Lead | 6h | Refactors concluídos |
| 13-14 | Implementar testes de fluxo de autenticação (login, forgot password, reset) | FE1 | 8h | Testes visuais base |

**Saída esperada:** WCAG 2.1 AA compliance confirmada, >80% de cobertura de testes para páginas públicas.

**Bloqueadores:** Nenhum técnico, mas requer acesso a ferramentas de acessibilidade.

---

### Semana 4: Performance + Polish

| Dia | Tarefa | Proprietário | Est. | Dependências |
|-----|--------|--|-----|---|
| 15 | Implementar lazy-load de imagens (Intersection Observer ou biblioteca) | FE2 | 6h | — |
| 15 | Code-split componentes de Landing com React.lazy() | FE1 | 4h | — |
| 16 | Monitorar Core Web Vitals com Lighthouse CI | DevOps | 3h | — |
| 16 | Otimizar imagens (WebP, srcset, compressão) | FE Lead | 4h | — |
| 17 | QA final (regressão visual, fluxos de auth, navegação) | QA | 8h | Todas as mudanças |
| 17-18 | Lançamento para staging + testes de aceitação | PM | 4h | QA concluído |

**Saída esperada:** LCP < 2.5s, CLS < 0.1, FID < 100ms (Core Web Vitals "Good").

**Bloqueadores:** Possível redesign de imagens (otimização pode impactar visual).

---

## 3. Gráfico de Gantt (Macro)

```
Semana 1 (Design System)
[=========] Unificação CSS/Tailwind      ████████ ✓
           
Semana 2 (i18n + SEO)
           [===========] i18n expansion  ████████ ✓
                   [=====] SEO/OG tags    ████████ ✓
                        
Semana 3 (A11y + Testes)
                  [==============] Acessibilidade ████████ ✓
                        [======] Testes visual/auth ████████ ✓
                        
Semana 4 (Performance)
                           [==========] Performance ████████ ✓
                                  [==] QA final       ████████ ✓
```

---

## 4. Métricas de Sucesso

| Métrica | Baseline | Target | Deadline |
|---------|----------|--------|----------|
| Lint de CSS duplicado (linhas) | ~200+ (est.) | 0 | D+5 |
| Páginas com i18n | 1 (Navigation) | 8+ (todas públicas) | D+12 |
| Acessibilidade (Axe issues) | TBD (audit) | < 5 (minor, wontfix) | D+19 |
| Cobertura de testes (páginas públicas) | 0% | > 80% | D+20 |
| LCP (Lighthouse) | TBD | < 2.5s | D+20 |
| SEO score (Lighthouse) | TBD | > 90 | D+12 |

---

## 5. Risks & Mitigations

| Risk | Probabilidade | Impacto | Mitigation |
|------|--|--|--|
| Mudança visual ao migrar para DS (clientes veem diferença) | **Média** | Alto | 1) Snapshot visual antes/depois. 2) QA lado-a-lado. 3) Comunicar mudança como "UI polish". |
| i18n requer config de backend (suporte a múltiplos idiomas em API) | **Baixa** | Médio | Strings de frontend são independentes de API. Backend pode continuar PT-only sem quebrar frontend i18n. |
| Testes de acessibilidade manual (VoiceOver/NVDA) requer equipamento Mac/Windows | **Média** | Baixo | Usar Axe DevTools (automation) como proxy. Teste manual em CI apenas em casos críticos. |
| Performance regression ao adicionar novos componentes | **Média** | Médio | 1) Bundle analysis (Vite plugin). 2) Lighthouse CI em cada commit. 3) Lazy-load por padrão. |

---

## 6. Estimativas de Custo (Horas)

```
Unificação Design System      : 40h (FE1 + FE2 em paralelo)
i18n Expansion               : 10h (FE1)
SEO + OG Tags                : 12h (FE2 + DevOps)
Acessibilidade               : 28h (FE1 + FE2 + QA)
Testes                       : 18h (FE1 + FE Lead)
Performance                  : 17h (FE2 + DevOps)
QA Final + Lançamento        : 12h (QA + PM)
─────────────────────────────────
**TOTAL**                    : **137 horas** (~17 dias @ 8h/dia com equipa de 2 FE + 1 QA + 1 DevOps)
```

**Alternativa reduzida (MVP compliance):**
- Unificação Design System: 40h
- i18n: 10h
- SEO base (title, description, OG): 8h
- Acessibilidade (Axe critical fixes): 12h
- **Subtotal MVP: 70h (~9 dias)**

---

## 7. Próximas Passos Imediatos (Amanhã)

1. **Audit Manual de CSS** — Alguém abre `src/index.css` e conta linhas por secção (hero-, pricing-, players-, etc.). Printscreen.
2. **Validação de i18n Atual** — Procurar `useTranslation()` em todos os ficheiros de page/component. É só em `Navigation` ou há mais?
3. **Teste Rápido de SEO** — Abrir LandingPage em Chrome → DevTools → Network → procurar meta tags no HTML. É `<title>Vite + React</title>` genérico ou dinâmico?
4. **Teste Rápido de A11y** — Instalar Axe DevTools, correr contra LandingPage. Quantos issues aparecem?
5. **Priorizar entre Unificação CSS vs. i18n** — Se LandingPage já está visualmente OK e CSS está bem, talvez i18n + SEO sejam mais urgentes para conversão. Se CSS está caótico, Fase 1 vem primeiro.

---

## 8. Comunicação Stakeholders

**Para Product:**
> "Páginas públicas têm as right componentes (Hero, Pricing, FAQ) mas implementação precisa de 3-4 semanas de trabalho para estar comercialmente pronta. Maiores gaps: i18n (so PT hoje), SEO base (sem Open Graph para sharing social), e unificação visual (two design systems lado-a-lado). Recomendação: priorizar Semana 2 (i18n + SEO) pois afetam conversão diretamente."

**Para Engineering:**
> "Refactor de CSS-to-Tailwind é automático, sem risk técnico. i18n infrastructure já existe (`I18nProvider`, `useTranslation` em Navigation), so é só expansão. Acessibilidade e testes são standard. Roadmap realista: 15-20 dias para compliance completo."

**Para QA:**
> "Depois da Semana 1, visual regression testing começa. Semana 3, acessibilidade audit + teste manual VoiceOver. Semana 4, final QA antes de lançamento."

---

## 9. Conclusão

As páginas públicas são a "porta de entrada" do produto. Hoje estão funcionais mas inacabadas. O roadmap acima traz-as para conformidade em 4 semanas, com impacto medido em conversão (i18n + SEO), acessibilidade legal, e qualidade duradoura (testes).

**Verde para começar?** ✅ Sim, com prioridade em Semana 2 (i18n + SEO) sobre tudo o resto, pois o ROI é mais alto (conversão direto).
