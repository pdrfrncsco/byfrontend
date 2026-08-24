Com base na análise do código fornecido do **Projecto BolaYetu**, realizei uma auditoria focada nas páginas públicas de **Competições, Clubes, Organizações e Jogadores**. O projecto já possui uma fundação sólida com React, Tailwind, React Query e um design system (glassmorphism, dark/light mode) bem definido.

Abaixo apresento a auditoria do estado atual e, de seguida, um **Plano de Refatoração (/plan)** para elevar estas páginas a um nível de excelência.

---

### 🔎 Auditoria do Estado Atual

**Pontos Fortes:**

* **Arquitetura de Dados:** Os tipos TypeScript (`PlayerDetail`, `ClubKpis`, `Organization`, `Match`) são ricos e bem estruturados, permitindo a construção de interfaces muito informativas.


* **Design System:** O uso de variáveis CSS (`--bg-card`, `--glass-blur`) e componentes partilhados como `ExplorePageShell`, `PublicListHero` e `DetailHeroCard` garantem uma base visual "Premium".


* **Gestão de Estado:** A utilização do `React Query` (ex: `useMatchLive`, `useTransfers`) prepara o terreno para interfaces rápidas e com cache.



**Áreas a Melhorar (Gargalos):**

* **CSS Legado vs Tailwind:** O ficheiro `index.css` contém muito CSS manual (ex: `.comp-list-page`, `.comp-card`, `.comp-match-row`) que foge à filosofia "utility-first" do Tailwind. Isto torna o código mais pesado e difícil de manter.


* **Falta de Visualização de Dados:** As interfaces estão muito focadas em listas e tabelas (ex: `comp-standings-table`). Falta interatividade (gráficos, mapas de calor, timelines visuais) para tornar os dados desportivos mais atrativos.


* **Carregamentos Iniciais:** Apesar de existirem Skeletons, as transições entre o modo de grelha/lista e os detalhes da entidade podem ser mais fluidas (micro-interações).

---

### 🚀 /plan: Refatoração das Páginas Públicas

Este plano foca-se em quatro pilares solicitados: **Profissional, Leve (Lightweight), Dinâmico e Informativo**.

#### FASE 1: Tornar o Código "Leve" (Lightweight & Clean Code)

O objetivo aqui é reduzir o CSS manual e uniformizar componentes.

1. **Eliminar CSS BEM (`index.css`):** Converter todas as classes `.comp-*` (ex: `.comp-card`, `.comp-match-row`, `.comp-tabs`) para componentes React com Tailwind CSS + `class-variance-authority` (CVA).


2. **Componentização de Grelhas e Listas:** Reutilizar o `EntityGrid` e `EntityCard` de forma universal para as listagens públicas de Clubes, Organizações e Jogadores, garantindo consistência visual.


3. **Lazy Loading Agressivo:** Implementar o `React.lazy` (já usado na `LandingPage`) nas rotas públicas pesadas e introduzir paginação infinita (`useInfiniteQuery`) nas listagens de Jogadores e Transferências em vez de paginação tradicional.



#### FASE 2: Tornar as Páginas "Informativas" (Data Storytelling)

Aproveitar os dados já existentes nos *types* para criar widgets desportivos imersivos.

1. **Perfil de Jogador (`PlayerDetail`):**
* Substituir listas de texto por uma **Timeline Visual** para o `career_history` (histórico de carreira).


* Adicionar Gráficos de Radar (ex: via *Recharts* ou *Chart.js*) para mostrar a `PlayerSeasonStatistics` (golos, assistências, minutos) comparada com a média da liga.




2. **Página de Clube (`mockClubKpis`):**
* Criar um widget visual do **Plantel Atual** agrupado por posição (Guarda-redes, Defesas, etc.), exibindo as fotos e números da camisola.
* Mostrar os `ClubKpis` (vitórias, empates, derrotas) em widgets circulares dinâmicos em vez de texto simples.




3. **Centro de Competições (`MatchCenter`):**
* Enriquecer a tabela de classificação (`comp-standings-wrapper`) com uma coluna de "Forma" (últimos 5 jogos com badges coloridos V-E-D).




4. **Organizações:**
* Mostrar estatísticas chave (`OrganizationKpis`) no topo e, se possível, integrar um mapa interativo com a localização dos clubes filiados.





#### FASE 3: Tornar as Páginas "Dinâmicas" (Interatividade & Real-Time)

Focar na sensação de que a plataforma está viva.

1. **Match Center em Tempo Real:** Melhorar o hook `useMatchLive` para refletir animações de pulsação (glowing effect) sempre que há um golo ou evento (utilizando as propriedades `--color-accent`).


2. **Filtros Dinâmicos sem Reload:** Na página pública de Jogadores (Scouting), implementar filtros combinados (Idade, Posição, Pé preferido) que atualizam a grelha instantaneamente usando transições do *Framer Motion* ou do *AutoAnimate*.
3. **Micro-interações:** Adicionar feedback tátil e visual ao passar o rato sobre jogadores e clubes (aproveitando as classes de `hover:-translate-y-1` já existentes, mas com transições mais suaves de escala).



#### FASE 4: Tornar a Aparência "Profissional" (Aesthetics & SEO)

Garantir que as páginas convertem visitantes em utilizadores registados.

1. **Layouts de Cabeçalho (Hero):** Utilizar o componente `PublicListHero` e `DetailHeroCard` em **todas** as páginas de detalhe (Jogador, Clube, Competição). Garantir que o logótipo/avatar flutua sobre o banner ao estilo das redes sociais desportivas profissionais.


2. **SEO e Partilha (Social Graph):** Garantir que o hook `useSeo` está configurado com tags OpenGraph (OG) dinâmicas para gerar previews atraentes quando um perfil de jogador ou clube do Projecto BolaYetu for partilhado no WhatsApp ou Twitter.


3. **Empty States Profissionais:** Substituir ecrãs brancos por componentes `EmptyState` com ilustrações temáticas de futebol sempre que um clube não tenha jogadores ou uma competição não tenha jogos agendados.