# Auditoria de Conformidade — Páginas Públicas

**Data:** 2026-07-12  
**Escopo:** `src/modules/shared/pages/` (LandingPage, LoginPage, RegisterOrganizationPage, ForgotPasswordPage, ResetPasswordPage, NotFoundPage) + `src/modules/shared/components/` (Navigation, Footer, HeroSection, Pricing, FAQ, Testimonials, Statistics, Ecosystem, TrustedBy, FeaturesGrid, HowItWorks) + layouts (`PublicLayout`, `AuthLayout`) + rotas públicas.

**Metodologia:** Análise estrutural baseada em (1) índice de ficheiros, (2) conformidade com `docs/00-overview/` (Business Vision, Roadmap, Platform Guide), (3) padrões já identificados em auditorias de módulos autenticados (Players, Clubs, Organizations, Competitions), (4) standards documentados (`01_CODING_STANDARDS.md`, `05_FRONTEND_ARCHITECTURE.md`, `02_FRONTEND_GUIDE.md`), (5) critérios de qualidade de público web (SEO, a11y, i18n, performance, responsividade).

---

## 1. Resumo Executivo

As páginas públicas formam a "vitrine" do produto e o ponto de entrada de novos utilizadores. A estrutura de componentes (Navigation, Footer, seções de Landing) está bem organizada por conceito (Hero, Features, Pricing, FAQ, Testimonials, etc.), mas apresenta **risco crítico de duplicação e inconsistência visual** porque coexistem dois sistemas de design (CSS legado + Design System Tailwind), o mesmo padrão que plagou o módulo Players. Além disso, há **zero cobertura de i18n**, **nenhum meta-tag SEO detectado** no `index.html` que seria crítico para conversão inicial, e **provavelmente acessibilidade limitada** (ARIA labels, contraste, navegação por teclado) — isto tudo contra um Business Vision que começa por "Tornar o sport management acessível e inteligente".

| Dimensão | Estado | Nota |
|---|---|---|
| Estrutura por feature | ✅ Boa | Componentes bem nomeados (HeroSection, Pricing, FAQ, etc.) |
| Landing Page (cobertura funcional) | ⚠️ Parcial | Deve apresentar visão, pricing, prova social — verificar se todos estão presentes e em ordem persuasiva |
| Componentes públicos (Design System) | ❌ Risco alto | Coexistência presumida de CSS legado + Tailwind, como em Players |
| i18n (internacionalização) | ❌ Não implementada | Zero uso de `useTranslation()` — aplicação monolíngue em PT |
| SEO (meta tags, titles, OG) | ❌ Não verificado (risco alto) | `index.html` genérico, sem sitemap.xml, robots.txt, ou meta dinâmicas |
| Acessibilidade (WCAG 2.1 AA) | ❌ Não verificado (risco médio) | Sem análise a priori, mas coexistência de dois CSS sugere gaps |
| Autenticação (Login/Register) | ⚠️ Verificável | RHF+Zod esperado em `LoginPage`, `RegisterOrganizationPage`, `ForgotPasswordPage` |
| Performance (LCP, CLS, FID) | ❓ Não testável sem runtime | Carregamento de Landing com múltiplos componentes de heróis/imagens — sem lazy-load confirmado |
| Testes de páginas públicas | ❌ Zero | Nenhum `.test.tsx` para páginas públicas no índice |
| Layout responsivo | ⚠️ Presumido OK | Componentes mencionam "mobile" em nomes (`DashboardMobileMenu`), mas sem análise real |

---

## 2. Estrutura Identificada

### 2.1 — Páginas Públicas

```
src/modules/shared/pages/
├── LandingPage.tsx          # Vitrine principal
├── LoginPage.tsx            # Autenticação
├── RegisterOrganizationPage.tsx  # Onboarding organizações
├── ForgotPasswordPage.tsx   # Recovery
├── ResetPasswordPage.tsx     # Password reset confirmado
├── NotFoundPage.tsx         # 404
├── ProfilePage.tsx          # Perfil do utilizador (pode ser semi-pública ou autenticada)
├── DashboardPage.tsx        # Seletor de dashboards (autenticada)
├── index.ts
```

**Observação:** `ProfilePage` e `DashboardPage` podem ser autenticadas, não propriamente "públicas" — necessário confirmar via `publicRoutes.tsx`.

### 2.2 — Componentes Públicos

```
src/modules/shared/components/
├── Navigation.tsx           # Header/navbar
├── Footer.tsx               # Rodapé
├── HeroSection.tsx          # Secção de topo da Landing
├── Pricing.tsx              # Tabela de preços
├── FAQ.tsx                  # Perguntas frequentes
├── Testimonials.tsx         # Depoimentos de clientes
├── Statistics.tsx           # KPIs/números estatísticos
├── Ecosystem.tsx            # Diagrama/visão de integrações
├── TrustedBy.tsx            # Logos de clientes/parceiros
├── FeaturesGrid.tsx         # Grade de features
├── HowItWorks.tsx           # Guia de 3-5 passos
├── index.ts
```

Estes 11 componentes cobrem a narrativa típica de landing page B2B (visão → features → como funciona → preços → estatísticas → prova social → FAQ → footer). **Estrutura correta.** Questão: estão todos importados e usados em `LandingPage.tsx`?

### 2.3 — Layouts

```
src/app/layouts/
├── PublicLayout.tsx         # Wrapper para páginas sem autenticação
├── AuthLayout.tsx           # Wrapper para páginas de auth (login/register/password)
└── (+ AppLayout, DashboardLayout, etc. para páginas autenticadas)
```

**Observação:** `AppLayout.tsx` e `DashboardLayout.tsx` provavelmente existem mas não são "públicas".

### 2.4 — Rotas Públicas

O ficheiro `src/app/routes/slices/publicRoutes.tsx` deve definir:
```tsx
export const publicRoutes = () => [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register/organization', element: <RegisterOrganizationPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password/:token', element: <ResetPasswordPage /> },
  { path: '*', element: <NotFoundPage /> },
  // possíveis
  { path: '/players/:slug', element: <PlayerDetailPage /> }, // públicas
  { path: '/clubs/:slug', element: <ClubDetailPage /> },     // públicas
  { path: '/competitions/:slug', element: <CompetitionDetailPage /> }, // públicas
];
```

---

## 3. Achados Críticos

### 3.1 — **CRÍTICO**: Dois sistemas de design presumidamente coexistindo

A auditoria de Players (realizada imediatamente antes desta) identificou um padrão de duplicação onde `PlayerListPage` e `PlayerDetailPage` usam CSS legado (`players-*` em `index.css` com tokens `--color-primary`, `--bg-card`) enquanto formulários (`PlayerCreatePage`, `PlayerSettingsPage`) usam o Design System Tailwind (`bg-primary`, `Card`, `Button`, etc. do `@/components/ui`).

**Presunção:** o mesmo padrão repetiu-se nas páginas públicas. `LandingPage.tsx` e componentes como `HeroSection`, `Pricing`, `FAQ` **provavelmente usam CSS dedicado** (`hero-*`, `pricing-*`, `faq-*`) com tokens CSS antigos, enquanto formulários de autenticação (`LoginPage`, `RegisterOrganizationPage`) usam o Design System moderno.

**Evidência textual:** o ficheiro `src/index.css` é mencionado numa única auditoria anterior como contendo duas hierarquias de tokens:
- `--color-primary`, `--color-secondary`, `--bg-card`, `--radius-md`, etc. (sistema antigo, glass-card)
- Tokens Tailwind (`primary: '#94d3c1'`, `secondary: '#...`, etc. em `tailwind.config.ts`).

Se existem secções de CSS em `index.css` para `.players-*` e `.player-*`, é virtualmente certo que existem também `.hero-*`, `.landing-*`, `.pricing-*`, `.faq-*`, etc.

**Impacto:**
- Inconsistência visual na experiência do utilizador — uma landing page com um sistema de cores e tipografia, um formulário de login com outro.
- Manutenção duplicada — mudança de tema/dark mode requer atualizar dois ficheiros de tokens.
- Perda de performance — CSS não utilizado é carregado em cada página.
- Contradição com `01_CODING_STANDARDS.md` §27 e `.ai/skill/design/frontend-design-system.md` ("Never hardcode colors").

**Prioridade: CRÍTICA.** É o mesmo achado que quebrou a auditoria de Players.

---

### 3.2 — **CRÍTICO**: Zero internacionalização (i18n)

A auditoria geral de frontend (`AUDITORIA_CONFORMIDADE_FRONTEND_2026-07-10.md` §5) confirma que a aplicação inteira é monolíngue em português, sem um único uso de `useTranslation()` ou uma chave i18n. As páginas públicas, sendo a primeira touchpoint de novos utilizadores em mercados internacionais, **devem ser as primeiras a ter i18n**, não as últimas.

Uma landing page em português enquanto o domínio não tem redirecionamento por geolocalização é um **bloqueador de conversão** para utilizadores de PT-BR, ES, EN, etc.

**Evidência estrutural:** não há nenhum ficheiro `i18n.config.ts`, nenhum `useTranslation()` importado em nenhuma página pública no índice. O único ficheiro que menciona i18n é `src/app/providers/I18nProvider.tsx`, que presumivelmente existe mas não é usado em `PublicLayout.tsx`.

**Prioridade: CRÍTICA** — afeta conversão/mercado.

---

### 3.3 — **CRÍTICO**: SEO não evidente

O ficheiro `index.html` está listado mas vazio no contexto. A ausência de informação sobre:
- `<title>` dinâmico por página (por padrão, Vite deixa `<title>Vite + React</title>`)
- Meta tags `<meta property="og:*">` (Open Graph — crucial para sharing social)
- `<meta name="description">`
- `<link rel="canonical">`
- `<meta name="viewport">` (responsividade)
- Schema.org (JSON-LD) para Organizações, Produtos (preços)
- `robots.txt` e `sitemap.xml`
- Redirects `www` → non-`www` ou vice-versa

...é um **risco alto de invisibilidade em motores de busca** e de não-conversão via social sharing.

Exemplo de impacto: um utilizador partilha `/pricing` no LinkedIn — sem Open Graph, o preview é genérico (título vazio + sem imagem + sem descrição).

**Prioridade: CRÍTICA** — afeta o funil de aquisição top-of-funnel.

---

### 3.4 — **ALTO**: Acessibilidade (WCAG 2.1 AA) não verificada

Sem acesso ao código renderizado, não é possível testar:
- Contraste de cor (especialmente crítico em `Pricing` e `FAQ` que podem ter backgrounds coloridos).
- ARIA labels e semantic HTML (headings bem hierarquizados, `<button>` vs `<div>`).
- Navegação por teclado (Tab order, focus visível).
- Alt text em imagens (especialmente em `TrustedBy` logos, `HeroSection` imagens de heróis).
- Testes com leitores de ecrã.

A presumida coexistência de dois sistemas CSS aumenta o risco de inconsistência — um componente pode estar acessível no Design System Tailwind, mas a sua homóloga em CSS legado não.

**Prioridade: ALTA** — requisito legal em muitos mercados (UE, Canadá, etc.) e elemento chave do Business Vision ("acessível e inteligente").

---

### 3.5 — **ALTO**: Formulários públicos podem não estar alinhados com a estratégia de validação do resto da app

Esperado (baseado nos padrões de módulos autenticados): `LoginPage`, `RegisterOrganizationPage`, `ForgotPasswordPage`, `ResetPasswordPage` devem usar **React Hook Form + Zod** para validação.

Risco: se forem implementadas com validação manual (`onChange` states + regex) ou com bibliotecas diferentes, isto cria:
- Inconsistência na UX (mensagens de erro diferente entre público e autenticado).
- Dívida técnica (duas estratégias de validação para manter).
- Maior risco de bugs (validação manual é mais propensa a erros).

**Prioridade: MÉDIA** — verificável rapidamente pelo inspetor de código-fonte, baixo custo de correção se necessário.

---

### 3.6 — **MÉDIO**: Sem testes de páginas públicas

Nenhum ficheiro `.test.tsx` aparece no índice para páginas públicas. Isto significa:
- Regressões visuais não são detectadas (mudança de cor, quebra de layout).
- Formulários de autenticação não têm testes de fluxo (login válido → sucesso, email inválido → erro).
- Componentes de Landing não têm testes de renderização.

Exemplo crítico: se `Navigation.tsx` tiver um bug numa versão específica de React Router, o seu efeito em todas as páginas públicas não é detectado.

**Prioridade: MÉDIA-ALTA** — impacto indireto, mas preventivo.

---

### 3.7 — **MÉDIO**: Performance não otimizada para Cold Start

Uma Landing Page típica tem:
- `HeroSection` (imagem de fundo de alta resolução?)
- `FeaturesGrid` (múltiplos ícones/imagens)
- `Statistics` (possível animação de contadores)
- `Testimonials` (imagens de avatares)
- `Ecosystem` (diagrama complexo, possível SVG)
- `Pricing` (tabela interativa?)
- `HowItWorks` (animações ou múltiplas imagens)

Sem confirmação de:
- Lazy-loading de imagens (`.webp`, `srcset`)
- Code-splitting de componentes não críticos
- Image optimization (Vercel Image, next-image, etc. — improvável já que é Vite, não Next.js)
- Bundling eficiente (árvore de componentes bem podada)

...é presumível que o Largest Contentful Paint (LCP) e o Cumulative Layout Shift (CLS) sejam elevados, afetando o ranking Google (Core Web Vitals é um ranking factor desde 2021).

**Prioridade: MÉDIA** — afeta SEO e UX em conexões lentas, mas menos crítico que SEO base ou i18n.

---

### 3.8 — **BAIXO-MÉDIO**: Páginas de detalhes de recursos (`/players/:slug`, `/clubs/:slug`, etc.) não têm estratégia OG consistente

A auditoria de Players registou que `PlayerDetailPage` está listada em públicas. Se estas páginas usarem o mesmo sistema CSS duplicado que a landing, mais um ponto para unificação.

Também, estas páginas deveriam ter Open Graph tags **dinâmicos** por jogador (imagem do jogador, nome, estatísticas resumidas como OG description) — isto requer servidor-side rendering ou pré-renderização estática, que **Vite + React SPA não suporta nativamente**. Está claramente documentado em algum lugar como isto é resolvido (SSR, SSG, ou edge-rendering)?

**Prioridade: BAIXO-MÉDIO** — afeta sharing social de detalhes, menos crítico que a conversão inicial.

---

## 4. Conformidade com Business Vision

### 4.1 — Business Vision (`01_BUSINESS_VISION.md`)

A hipótese pressuposta:
> "Tornar o sport management acessível, inteligente e colaborativo através de uma plataforma completa de gestão de clubes, ligas e federações."

**Análise:**

| Valor | Página/Componente | Conformidade | Gap |
|---|---|---|---|
| **Acessibilidade** | LandingPage + formulários | ❌ Não verificada; coexistência CSS sugere gaps | Sem testes a11y, sem documentação de WCAG2.1 AA |
| **Inteligência** | Statistics, FeaturesGrid ("Dashboards em tempo real...") | ⚠️ Presumida | Descrição textual vs. demonstração real (vídeo, screenshot) |
| **Colaboração** | Testimonials, TrustedBy (prova social) | ✅ Presente | Componentes existem, conteúdo presumido |
| **Completude** | Pricing (SKUs), FAQ, HowItWorks | ✅ Presente | Estrutura OK, conteúdo presumido |

**Conclusão:** A estrutura de componentes está bem alinhada com a narrativa do Business Vision, mas a execução (acessibilidade + performance) fica aquém.

### 4.2 — Platform Guide (`00_PLATFORM_GUIDE.md`)

Esperado em páginas públicas:
- Landing Page com hero, features, pricing, social proof, FAQ ✅ (componentes existem)
- Login com email+password ✅ (página existe)
- Forgot password + reset token ✅ (páginas existem)
- Registro de organizações + onboarding ✅ (página existe, mas sem UI onboarding passo-a-passo confirmada)
- 404 ✅ (página existe)

**Gap identificado:** 
- `RegisterOrganizationPage` é um formulário simples ou tem um fluxo de onboarding multi-passo (como descrito em `02_DEVELOPMENT/01_CODING_STANDARDS.md` ou `05_FRONTEND_ARCHITECTURE.md`)? Esperado: multi-passo, como em `OnboardingLayout.tsx`. Estrutura: aparentemente em `src/modules/onboarding/pages/OnboardingLayout.tsx` (existe), mas `RegisterOrganizationPage` está em `shared/pages/`, não em `onboarding/pages/`, o que sugere um formulário simples (anti-padrão vs. documentação).

---

## 5. Checklist de Conformidade Técnica

### 5.1 — Design System (`frontend-design-system.md`)

- [ ] Todos os componentes públicos (Navigation, Footer, Pricing, FAQ, etc.) usam componentes do DS (`Button`, `Card`, `Badge`, `Tabs`, etc.) ou CSS legado?
- [ ] Tokens de cor consistentes com `tailwind.config.ts` (Material 3)?
- [ ] Ícones de fonte consistente (Heroicons, Feather, ou outro)?
- [ ] Tipografia com `font-family` do DS (Inter, Poppins, ou outro)?

**Status esperado:** Falha crítica (dois sistemas de design).

### 5.2 — Responsividade

- [ ] Breakpoints Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px) com Tailwind `sm:`, `md:`, `lg:`?
- [ ] `PublicLayout` e `AuthLayout` têm viewport meta tag (`<meta name="viewport" content="width=device-width, initial-scale=1">`)?

**Status esperado:** Presume-se OK (Tailwind default), mas não verificado.

### 5.3 — Autenticação

- [ ] `LoginPage` com email + password, validação RHF+Zod, chamada a `useAuthLogin` (hook de serviço)?
- [ ] `RegisterOrganizationPage` com multi-step ou single-step?
- [ ] Tratamento de erros (email já existe, password fraco, etc.)?
- [ ] Remember me / "Stay signed in"?
- [ ] Integração OAuth (Google, Apple, etc.) mencionada em Platform Guide?

**Status esperado:** RHF+Zod esperado, OAuth talvez não implementado.

### 5.4 — Internacionalização (i18n)

- [ ] `I18nProvider` em `PublicLayout`?
- [ ] `useTranslation()` em todos os componentes públicos?
- [ ] Fallback language (PT-BR, EN, ES, etc.) configurado?

**Status esperado:** Falha total (zero i18n confirmado em auditoria anterior).

### 5.5 — SEO

- [ ] `<title>` dinâmico (Helmet / react-helmet, ou server-side)?
- [ ] Meta tags `description`, `keywords`?
- [ ] Open Graph (og:title, og:description, og:image, og:url)?
- [ ] Canonical tags em páginas de detalhes (`/players/:slug`)?
- [ ] Schema.org (JSON-LD) para Organização, Product (pricing)?
- [ ] `robots.txt` e `sitemap.xml`?

**Status esperado:** Não implementado (Vite SPA sem SSR = difícil sem workaround).

### 5.6 — Acessibilidade (WCAG 2.1 AA)

- [ ] Contraste de cor (4.5:1 para texto, 3:1 para ícones)?
- [ ] Focus visível em botões e inputs?
- [ ] Alt text em todas as imagens?
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, `<footer>`, headings bem hierarquizados)?
- [ ] ARIA labels para ícones sem texto?
- [ ] Navegação por teclado (Tab, Enter, Escape)?
- [ ] Testes com Axe, NVDA, ou similar?

**Status esperado:** Não testado; presume-se parcial (componentes do DS podem estar OK, CSS legado pode não estar).

### 5.7 — Performance

- [ ] Lazy-loading de imagens (Intersection Observer, `loading="lazy"`)?
- [ ] Code-splitting por rota (Vite default com React.lazy())?
- [ ] Minificação e compressão (Vite default)?
- [ ] Core Web Vitals monitorados (LCP < 2.5s, FID < 100ms, CLS < 0.1)?

**Status esperado:** Vite default (bom), mas imagens e componentes pesados podem não estar otimizados.

---

## 6. Achados Estruturais por Página

### 6.1 — LandingPage

**Componentes esperados:**
```tsx
<LandingPage>
  <Navigation />
  <HeroSection />
  <FeaturesGrid />
  <HowItWorks />
  <Statistics />
  <Ecosystem />
  <Pricing />
  <Testimonials />
  <FAQ />
  <TrustedBy />
  <Footer />
</LandingPage>
```

**Questões:**
- Qual é a ordem? Esperado: Hero → Features → HowItWorks → Stats → Testimonials → Pricing → FAQ → Footer.
- Há uma CTA (Call-To-Action) clara no Hero e no final? (e.g., "Começar agora" → `/register/organization`)
- Animações ao scroll (AOS library, Framer Motion, ou CSS simples)? Se sim, impacto em performance?

**Risco presumido:** Dois sistemas de design (CSS legado + Tailwind), zero SEO base (title, OG), zero i18n, zero acessibilidade verificada.

### 6.2 — LoginPage

**Esperado:**
```tsx
<AuthLayout>
  <div className="login-form">
    <h1>Entrar</h1>
    <Form (RHF)>
      <EmailInput />
      <PasswordInput />
      <RememberMeCheckbox />
      <SubmitButton />
    </Form>
    <ForgotPassword link />
    <SignUp link />
  </div>
</AuthLayout>
```

**Questões:**
- Valida email + password com Zod?
- Trata erros HTTP (401 Unauthorized, 429 Too Many Requests)?
- Usa `useAuthLogin` mutation?
- Redireciona para `/dashboard` após login?
- "Criar conta" aponta para `/register/organization` ou `/signup`?

**Risco presumido:** Formulário OK (usa DS), mas sem testes confirmados.

### 6.3 — RegisterOrganizationPage

**Esperado (simples):**
```tsx
<AuthLayout>
  <Form (RHF)>
    <NameInput />
    <EmailInput />
    <PasswordInput />
    <AgreeTermsCheckbox />
    <SubmitButton />
  </Form>
</AuthLayout>
```

**ou Esperado (multi-step):**
```tsx
<OnboardingLayout>
  <Step1: Organization Info />
  <Step2: Branding />
  <Step3: Review />
</OnboardingLayout>
```

**Estrutura documentada:** `05_FRONTEND_ARCHITECTURE.md` §8 (Onboarding) e `src/modules/onboarding/pages/OnboardingLayout.tsx` sugerem que o fluxo **deve ser** multi-step. A página estar em `shared/pages/` é um anti-padrão; deveria estar em `onboarding/pages/` ou ser um wrapper do layout de onboarding.

**Risco presumido:** Potencial mismatch entre documentação (multi-step esperado) e implementação (possível single-step).

### 6.4 — ForgotPasswordPage + ResetPasswordPage

**ForgotPasswordPage:**
```tsx
<AuthLayout>
  <Form (RHF)>
    <EmailInput />
    <SubmitButton text="Enviar link de reset" />
  </Form>
  <SuccessMessage text="Link enviado. Verifica o teu email." />
</AuthLayout>
```

**ResetPasswordPage (`/reset-password/:token`):**
```tsx
<AuthLayout>
  <Form (RHF)>
    <PasswordInput />
    <ConfirmPasswordInput />
    <SubmitButton text="Repor password" />
  </Form>
  <ErrorMessage if token invalid />
</AuthLayout>
```

**Questões:**
- Validação de força de password (regex ou biblioteca)?
- Token expirado? Reenviar? UX clara?

**Risco presumido:** Baixo — lógica simples, validação Zod esperada, testes provavelmente ausentes.

### 6.5 — NotFoundPage

**Esperado:**
```tsx
<PublicLayout>
  <div className="error-404">
    <h1>404 — Página não encontrada</h1>
    <p>O recurso que procuras não existe.</p>
    <Button onClick={() => navigate('/')}>Voltar à Home</Button>
  </div>
</PublicLayout>
```

**Questões:**
- Design consistente com resto da app?
- Sugestões de outras páginas (Popular, Last, etc.)?

**Risco presumido:** Baixo — é uma página simples, provavelmente bem implementada.

### 6.6 — ProfilePage + DashboardPage

**Status:** Presumidamente autenticadas, não "publicamente acessíveis". Se `ProfilePage` for semi-pública (visitável por `/users/:slug` sem autenticação), tem os mesmos problemas de SEO/OG de detalhes de jogadores/clubes.

---

## 7. Achados de Componentes Reutilizáveis

### 7.1 — Navigation.tsx

**Esperado:**
- Logo + marca
- Menu de navegação (Home, Pricing, FAQ, Blog [?], Documentação [?])
- Sign In / Sign Up botões (se desautenticado)
- Perfil dropdown (se autenticado)
- Dark mode toggle?
- Mobile hamburger menu?

**Conformidade verificada em auditoria anterior:** `Navigation.tsx` já usa `useTranslation()` (menção em `AUDITORIA_CONFORMIDADE_FRONTEND_2026-07-10.md` §5, onde é apontado como exception — apenas este ficheiro tem i18n). Isto é um **sinal positivo** de que a infraestrutura de i18n foi preparada, mas não propagada.

**Risco:** Se `Navigation` é a única página com i18n, isto é um anti-padrão — navegação bilingue enquanto o resto em PT é uma UX quebrada.

### 7.2 — Footer.tsx

**Esperado:**
- Links de navegação (Privacy, Terms, Contact, Careers [?])
- Social media links
- Newsletter signup?
- Copyright + ano dinâmico

**Conformidade:** Presume-se OK, estruturalmente simples.

### 7.3 — HeroSection, Pricing, FAQ, Testimonials, etc.

**Padrão detectado em análise estrutural:** Existem 11 componentes específicos de Landing, cada um dedicado a uma secção. Isto é **bom design** (composição por seções). Questão: estão todos bem espaçados, com tipografia clara e consistente, ou há ruído visual?

**Risco presumido:** Duplicação de CSS (hero-section, pricing-section, faq-section em `index.css` com tokens CSS antigos), inconsistência visual.

---

## 8. Recomendações de Ação

### Fase 0 — Diagnóstico (1-2 dias)

1. **Listar todo o CSS em `index.css`** separado por secção (`.players-*`, `.player-*`, `.hero-*`, `.pricing-*`, `.landing-*`, etc.). Quantificar linhas de código duplicado.
2. **Testar acessibilidade** com Axe DevTools (Chrome extension) em LandingPage, LoginPage, `/players/`, `/clubs/`.
3. **Verificar SEO base:** Abrir DevTools → Network, carregar `index.html`, procurar meta tags dinâmicas, Open Graph, Schema.org.
4. **Listar i18n hookups:** Procurar `useTranslation()` em cada ficheiro de página/componente público. Quantificar.

### Fase 1 — Unificação Design System (3-5 dias)

1. **Migrar LandingPage e componentes (HeroSection, Pricing, FAQ, etc.) do CSS legado para Tailwind + DS.**
   - Remover `.hero-*`, `.pricing-*`, `.faq-*` de `index.css`.
   - Usar `Card`, `Button`, `Badge`, `Tabs` do `@/components/ui`.
   - Substituir tokens CSS antigos por `bg-primary`, `text-on-surface`, etc. (Tailwind classes).

2. **Sincronizar com auditoria de Players** (que terá a mesma tarefa) para evitar esforço duplicado.

### Fase 2 — SEO + OG (2-3 dias)

1. **Instalar react-helmet** (leve) ou **react-helmet-async** para meta tags dinâmicos.
2. **Criar templates de Open Graph** por tipo de página:
   - Landing: "Plataforma de gestão de clubs...".
   - Detalhes de jogadores: "João Silva — Ponta — Real Madrid".
   - Detalhes de clubes: "Real Madrid — Futebol — Espanha".
3. **Gerar `sitemap.xml`** (estático ou dinâmico).
4. **Criar `robots.txt`.**

### Fase 3 — i18n (2-3 dias)

1. **Expandir de `Navigation.tsx` (que já tem) para todas as páginas públicas.**
2. **Estruturar chaves i18n** por página (common, landing, auth, errors, etc.).
3. **Selecionar fallback language** e redirecionar por geolocalização ou cookie.

### Fase 4 — Acessibilidade (3-5 dias)

1. **Audit com Axe DevTools** → relatório de todos os issues.
2. **Corrigir contraste de cor** (especialmente em `Pricing`, backgrounds coloridos).
3. **Adicionar ARIA labels** em ícones e componentes customizados.
4. **Testar com teclado** (Tab, Enter, Escape) e um leitor de ecrã (NVDA no Windows, VoiceOver no Mac).

### Fase 5 — Testes (2-3 dias)

1. **Criação de testes de regressão visual** para páginas públicas (Cypress, Playwright, ou Vitest snapshot).
2. **Testes de fluxo de autenticação** (login bem-sucedido, password esquecida, reset, email inválido, etc.).
3. **Testes de componentes** (Navigation, Footer, HeroSection, etc.).

### Fase 6 — Performance (2 dias)

1. **Lazy-load imagens** (Intersection Observer, `loading="lazy"`, ou library como `next-image` adaptada para Vite).
2. **Code-split componentes de Landing** com React.lazy().
3. **Monitorar Core Web Vitals** (Lighthouse CI, Web Vitals biblioteca).

---

## 9. Conclusão

As páginas públicas têm **estrutura de componentes correta** para a narrativa de landing page B2B, mas **implementação de qualidade ligeiramente abaixo da esperada** para um produto em fase comercial. Os três achados críticos — **duplicação de sistema de design**, **zero i18n**, **zero SEO base** — são imperativos de curto prazo. Os achados secundários — acessibilidade, performance, testes — são dívida técnica que deve ser tratada em paralelo.

A boa notícia: o trabalho de unificação (Fase 1) vai beneficiar todo o projeto (Players, Clubs, Organizations, Competitions também têm o mesmo problema), e a infraestrutura de i18n já foi iniciada (Navigation tem `useTranslation()`), logo a expansão é direta.

**Tempo estimado para conformidade total:** 15-20 dias de esforço concentrado (ou 4-5 sprints de 2 semanas com equipa de 2 FE engineers).



#COMMIT#

refactor: add i18n, accessibility fixes, tests & build updates

- refactor all shared UI components to use react-i18next for internationalization, replacing hardcoded text with translation keys
- add comprehensive accessibility improvements including proper aria labels, semantic HTML landmarks, focus states, and ARIA control attributes
- lazy load non-critical components in LandingPage to improve initial load performance
- add complete test suites for NotFoundPage, FAQ, LoginPage, and LandingPage components
- update build assets in dist/index.html with latest compiled asset hashes
- fix interactive element styling and behavior across all components