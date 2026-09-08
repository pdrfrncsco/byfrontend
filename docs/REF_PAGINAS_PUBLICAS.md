Uma auditoria de UX/UI voltada para as **páginas públicas** é essencial para transformar o primeiro ponto de contato da plataforma em uma experiência envolvente, de alta conversão e com padrão visual de produto de tecnologia desportiva moderna (Sports Tech SaaS).

Abaixo está o diagnóstico detalhado das páginas e componentes públicos existentes no projeto (`byfrontend`), seguido pelo plano completo de refatoração visual e funcional.

---

# 1. Diagnóstico e Auditoria Heurística das Telas Públicas

### 1.1 Mapeamento do Escopo Público Atual

O ecossistema público do projeto é composto por:

* **Layout e Navegação:** `PublicLayout.tsx`, `PublicHeader.tsx`, `Navigation.tsx` e `Footer.tsx`.


* **Página Inicial (Landing Page):** `LandingPage.tsx`, composta por blocos modulares (`HeroSection`, `TrustedBy`, `FeaturesGrid`, `HowItWorks`, `Ecosystem`, `Statistics`, `Pricing`, `Testimonials`, `FAQ`).


* **Diretório e Descoberta:** `ExplorePage.tsx` e submódulo `explore/` (`ExplorePageShell`, `SearchToolbar`, `EntityGrid`, `EntityCard`, `ExploreSection`, `ResultCount`).


* **Páginas de Detalhes Públicos:** `PublicDetailPageShell.tsx`, `DetailHeroCard.tsx` e `PublicListHero.tsx`.


* **Páginas de Autenticação/Entrada:** `LoginPage.tsx`, `RegisterPage.tsx`, `RegisterOrganizationPage.tsx`, `RegisterProfilePage.tsx`, `ForgotPasswordPage.tsx` e `NotFoundPage.tsx` sob o `AuthLayout.tsx`.



---

### 1.2 Principais Problemas de UX e Débitos Visuais Identificados

| Componente / Página | Problema Encontrado | Impacto na Experiência (UX / UI) |
| --- | --- | --- |
| **Header & Navegação** | Convivência de dois cabeçalhos (`Navigation.tsx` e `PublicHeader.tsx`) no mesmo ecossistema compartilhado.

 | Inconsistência visual (altura, comportamento no scroll/glassmorphism) e menus mobile duplicados. |
| **Landing Page** | Pilha linear longa e monótona de 9 seções estáticas sem quebras de ritmo ou dinamismo interativo.

 | Fadiga visual, alta taxa de rejeição (*bounce rate*) antes de o utilizador chegar aos planos de preços ou ecossistema. |
| **Hero Section** | Foco primário em texto estático e botões genéricos, sem demonstração visual do produto em ação.

 | Falta de apelo imediato; o visitante não visualiza o software (painéis de jogo, gráficos de atletas ou estatísticas). |
| **Explore / Descoberta** | `SearchToolbar.tsx` e `EntityGrid.tsx` possuem filtros rígidos e cards genéricos (`EntityCard.tsx`).

 | Dificuldade em navegar entre tipos de entidades (Clubes vs. Jogadores vs. Ligas); falta de destaque para emblemas, divisões e métricas-chave. |
| **Public Detail Shell** | Páginas públicas de visualização (`PublicDetailPageShell.tsx`) carecem de identidade desportiva imersiva.

 | Apresentação árida dos dados do clube ou atleta, sem o formato atrativo de "cartão desportivo / scout card". |
| **Auth / Registo Público** | `RegisterPage.tsx` e `RegisterOrganizationPage.tsx` são formulários diretos sem reforço de proposta de valor lateral.

 | Menor taxa de conversão; o utilizador sente atrito burocrático ao preencher campos longos sem estímulo visual. |
| **Responsividade & Acessibilidade** | Tabelas de preços (`Pricing.tsx`) e grids de entidades não adaptam densidade em ecrãs pequenos.

 | Rolagem horizontal indesejada no mobile e quebra de alinhamento em ecrãs entre 360px e 768px. |

---

# 2. Plano de Refatoração Visual e UX

O objetivo é transformar a área pública numa interface no padrão de referências globais de Sports Tech e SaaS de elite (Linear, Transfermarkt Pro e Wyscout), com estética limpa, tipografia expressiva e microinterações polidas.

---

## Fase 1: Unificação da Infraestrutura de Layout Público

### 1. Eliminação da Redundância no Cabeçalho

* **Ação:** Consolidar `Navigation.tsx` e `PublicHeader.tsx` num único componente canónico: `src/modules/shared/components/PublicHeader.tsx`.


* **Melhorias de UI:**
* **Header Flutuante Dinâmico:** Efeito de *glassmorphism* com desfoque de fundo (`backdrop-blur-md bg-background/80 border-b border-border/40`) que surge de forma suave ao rolar a página.
* **Navegação com Agrupamento Lógico:**
* *Plataforma* (Funcionalidades, Ecossistema, Inteligência de Dados).
* *Explorar* (Clubes, Competições, Atletas).
* *Planos* (Preçário para Federações, Associações e Clubes).


* **Menu Mobile Otimizado:** Menu em gaveta deslizante (*sheet*) com suporte a toques confortáveis (alvos mínimos de 48px), evitando listas colapsadas com texto pequeno.



### 2. Rodapé Institucional Reestruturado (`Footer.tsx`)



* Reorganizar o rodapé em 4 colunas temáticas:
* **Produto:** Funcionalidades, Gestão de Competições, Estatísticas, Transferências.
* **Ecosistema:** Diretório Público, Federações, Clubes Parceiros, Academia.
* **Legal & Conformidade:** Termos de Uso, Política de Privacidade, Regulamentos e Proteção de Dados.
* **Newsletter / Novidades:** Campo compacto para capturar e-mails institucionais de dirigentes e olheiros.



---

## Fase 2: Redesign Visual e Storytelling da Landing Page

A página inicial deve contar uma história que converta tanto dirigentes quanto adeptos e atletas.

```
┌────────────────────────────────────────────────────────┐
│  [Header Flutuante com Glassmorphism & Botões de Ação] │
├────────────────────────────────────────────────────────┤
│  1. Hero Section: Título de Impacto + Interactive      │
│     Mockup Flutuante (Dashboard de Jogos & Scouting)   │
├────────────────────────────────────────────────────────┤
│  2. Prova Social: Federações, Ligas e Clubes em Marquee│
├────────────────────────────────────────────────────────┤
│  3. Interactive Tab Showcase: "Uma plataforma para..." │
│     [Para Federações] | [Para Clubes] | [Para Atletas] │
├────────────────────────────────────────────────────────┤
│  4. Estatísticas & Impacto Real (KPI Counters Dinâmicos│
├────────────────────────────────────────────────────────┤
│  5. Live Ecosystem Explorer (Preview do Diretório)     │
├────────────────────────────────────────────────────────┤
│  6. Tabela de Preços Transparente com Switch Anual/Mês │
├────────────────────────────────────────────────────────┤
│  7. Depoimentos em Carrossel + FAQ com Accordion       │
├────────────────────────────────────────────────────────┤
│  8. CTA Final de Conversão com Imagem de Fundo Desportiva│
└────────────────────────────────────────────────────────┘

```

### Principais Refatorações por Bloco:

1. **`HeroSection.tsx` (Conversão Imediata):**

* Adicionar um elemento de **prova de valor visual**: à direita (ou centralizado abaixo do texto no mobile), incluir um *mockup flutuante* com interface real do sistema (um card de partida ao vivo com radar de atributos ou lista de classificação).
* Inserir um selo de novidade (*pill badge*) no topo: `[Novo] Módulo de Competições e Transferências 2026`.
* Dois botões de ação com contraste hierárquico claro:
* Primário: `"Criar Organização"` (botão sólido em destaque com ícone de seta).
* Secundário: `"Explorar Diretório Público"` (botão com contorno e fundo translúcido).




2. **`FeaturesGrid.tsx` & `Ecosystem.tsx` (Fim das listas monótonas):**

* Substituir cards idênticos por um layout no estilo **Bento Grid**:
* Bloco Grande: Gestão Centralizada de Torneios e Partidas ao Vivo.
* Bloco Médio: Perfil Biométrico e Contratual de Jogadores.
* Bloco Pequeno: Gestão de Ativos de Mídia e Fotos Oficiais.
* Bloco Pequeno: Emissão de Súmulas e Relatórios de Arbitragem.




3. **`Pricing.tsx` (Decisão de Compra Facilitada):**

* Introduzir alternador de frequência de faturação: **Mensal / Anual (com badge de "20% OFF")**.
* Destacar o plano intermediário ("Clube Pro" ou "Associação Regional") com borda iluminada (`ring-2 ring-primary`) e etiqueta `"Mais Popular"`.
* Checklist com ícones de validação verde suave e descrições claras de limites (ex: *Até X atletas*, *Competições ilimitadas*).


4. **`FAQ.tsx` (Redução de Dúvidas):**

* Utilizar componente de acordeão suave (Radix/Shadcn Accordion) em vez de textos expandidos fixos, categorizando perguntas para federações, clubes e atletas.



---

## Fase 3: Modernização do Módulo de Exploração e Busca (`ExplorePage`)

A página de busca pública (`src/modules/shared/pages/ExplorePage.tsx`) é a vitrine pública de atletas, equipas e campeonatos.

### 1. Barra de Pesquisa e Filtros Rápidos (`SearchToolbar.tsx`)



* **Segmentação por Abas (Segmented Controls):**
* Abas no topo com contadores em tempo real: `Todos`, `Clubes (42)`, `Competições (8)`, `Atletas (1.250)`.


* **Chips de Filtro Rápido:**
* Província / Localização, Categoria etária (Sub-17, Sub-20, Sénior), Modalidade/Gênero.


* **Busca Preditiva com Debounce:**
* Uso do hook existente `useDebounce.ts` para pesquisa instantânea sem travamentos de renderização.





### 2. Redesign dos Cards de Entidade (`EntityCard.tsx`)



* **Card de Atleta:**
* Avatar com foto oficial, bandeira de nacionalidade, posição em destaque (ex: `AVANÇADO / MC`), clube atual com escudo em miniatura, e mini-badges de estatísticas (Partidas, Golos, Minutos jogados).


* **Card de Clube:**
* Emblema centralizado com sombra suave, cidade/sede, quantidade de atletas registados e competição principal ativa.


* **Card de Competição:**
* Status atual (ex: `Em Andamento`, `Inscrições Abertas`), total de jornadas e clubes participantes.


* **Microinteração:** Efeito de elevação suave ao passar o cursor (`transition-all hover:-translate-y-1 hover:shadow-lg`).

---

## Fase 4: Experiência de Detalhes Públicos (`PublicDetailPageShell.tsx`)

Os perfis públicos de jogadores e clubes precisam parecer páginas de alta qualidade para olheiros e jornalistas.

1. **Banner de Cabeçalho Dinâmico (`DetailHeroCard.tsx`):**

* Layout estilo capa desportiva: imagem de fundo com gradiente escurecido, emblema ou foto oficial em alta resolução e selo de validação oficial da Federação.


2. **Abas de Conteúdo no Perfil:**
* *Visão Geral:* Biografia desportiva, dados físicos (altura, pé preferencial), clube atual.
* *Histórico e Estatísticas:* Gráficos limpos de partidas e golos por época.
* *Carreira e Transferências:* Linha do tempo resumida.


3. **Botão de Compartilhamento & Ação:**
* Botão nativo para copiar link de partilha com feedback visual de confirmação (*"Link copiado!"*).



---

## Fase 5: Aprimoramento do Fluxo de Autenticação e Entrada

As páginas `LoginPage.tsx`, `RegisterPage.tsx` e `RegisterOrganizationPage.tsx` não devem ser formulários isolados.

* **Layout Split-Screen (Tela Dividida):**
* **Lado Esquerdo:** Formulário de entrada minimalista, com validação de campos em tempo real, inputs com estados claros de foco e botões de submissão com feedback de carregamento (*spinner*).
* **Lado Direito (Oculto em mobile, visível em telas `>= lg`):** Painel editorial com imagem de futebol em alta definição, depoimento de um diretor desportivo e dados de credibilidade (*"Mais de 10.000 atletas e partidas geridas"*).


* **Fluxo de Recuperação e Redefinição:**
* Nas páginas `ForgotPasswordPage.tsx` e `ResetPasswordPage.tsx`, adicionar indicador de passos e mensagem de sucesso com instruções claras de verificação na caixa de entrada.





---

# 3. Especificação do Design System para Telas Públicas

Para garantir a coerência estética em toda a aplicação, os estilos no Tailwind CSS (`tailwind.config.ts` e `index.css`) devem seguir regras precisas:

### Cores e Superfícies

* **Fundo Público:** Tons escuros profundos ou neutros limpos (ex.: Slate 950 `#020617` para modo escuro premium ou Slate 50 `#f8fafc` para modo claro), garantindo contraste WCAG AA/AAA.
* **Cor de Destaque Primária (Brand):** Verde relvado tecnológico (ex.: Emerald 500 `#10b981`) ou Azul institucional (ex.: Indigo 600 `#4f46e5`), utilizado com parcimônia para guiar os olhos do utilizador aos CTAs principais.
* **Bordas e Linhas divisórias:** Bordas sutis com opacidade reduzida (`border-slate-200/80` no tema claro e `border-slate-800/60` no tema escuro) para criar profundidade sem poluír a tela.

### Tipografia

* **Títulos (Headings):** Família sem serifa limpa com tracking negativo leve (`tracking-tight`), pesos `font-bold` (700) ou `font-extrabold` (800) para criar hierarquia assertiva.
* **Corpo de Texto:** Tamanho base legível (`text-base` ou `text-sm` com `leading-relaxed`), garantindo conforto de leitura tanto no desktop quanto no telemóvel.

---

# 4. Roteiro de Execução Recomendado

```
[Semana 1] ─── Fase 1: Unificação de Header (PublicHeader.tsx) e Footer.tsx
[Semana 2] ─── Fase 2: Redesign completo da LandingPage (Hero, Bento Grid de Features e Preços)
[Semana 3] ─── Fase 3: Modernização da ExplorePage, SearchToolbar e Cards de Entidades
[Semana 4] ─── Fase 4 & 5: PublicDetailPageShell, Refatoração do Split-Screen de Auth e Otimização SEO/LCP

```

Este plano transforma as rotas públicas de uma simples coleção de telas numa vitrine digital profissional e fluida, elevando a percepção de valor da plataforma e impulsionando a captação de novos utilizadores e organizações.