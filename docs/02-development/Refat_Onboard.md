Com base na análise da estrutura do repositório em anexo, foi realizada uma auditoria técnica aprofundada dos fluxos e componentes de Onboarding existentes no projeto (`byfrontend`), identificando as lacunas arquiteturais e propondo um plano completo de refatoração alinhado às melhores práticas de engenharia de software e UX/UI da indústria.

---

# 1. Diagnóstico e Auditoria do Onboarding Atual

### 1.1 Mapeamento dos Fluxos Existentes

A plataforma possui três vertentes de onboarding com níveis de maturidade muito discrepantes:

1. **Onboarding de Organização / Tenant (`src/modules/onboarding/`):**
* **Fluxo:** Estruturado em etapas lineares (`OrganizationStep.tsx`, `BrandingStep.tsx`, `CompetitionStep.tsx`, `ReviewStep.tsx`) sob o `OnboardingLayout.tsx`.


* **Controle de Rota:** Utiliza `OnboardingGuard.tsx`, `PendingOnboardingRedirect.tsx` e `resolvePostAuthRedirect.ts`.


* **Estado Atual:** Encontra-se **incompleto / esquelético**. Os arquivos `components/index.ts`, `constants/index.ts`, `hooks/index.ts`, `schemas/index.ts`, `services/index.ts`, `types/index.ts` e `pages/index.ts` contêm apenas declarações vazias (`export {}`). Não há validação tipada por Zod centralizada nem integração padronizada com a API.




2. **Onboarding do Jogador / Atleta (`src/modules/players/`):**
* **Fluxo:** É o fluxo mais detalhado e maduro da base, compreendendo 8 passos: Welcome (`PlayerOnboardingWelcomePage.tsx`), Perfil Básico (`PlayerOnboardingProfilePage.tsx`), Identidade/Documentos (`PlayerOnboardingIdentityPage.tsx`), Contato/Emergência (`PlayerOnboardingContactPage.tsx`), Histórico Futebolístico (`PlayerOnboardingFootballPage.tsx`), Dados Suplementares/Médicos (`PlayerOnboardingSupplementalPage.tsx`), Revisão Geral (`PlayerOnboardingReviewPage.tsx`) e Conclusão (`PlayerOnboardingCompletePage.tsx`).


* **Estado e Guard:** Possui o hook `usePlayerOnboardingState.ts` e o guard de proteção `PlayerOnboardingGuard.tsx`.


* **Testes:** Já conta com cobertura E2E básica no Cypress (`player-onboarding.cy.ts`).




3. **Onboarding de Clube (`src/modules/clubs/`):**
* **Fluxo:** Implementado em uma única página monolítica (`ClubOnboardingPage.tsx`).


* **Estado Atual:** Não possui um Stepper/Wizard nem modularização equivalente à do Jogador ou da Organização, além de não contar com um guard de ciclo de vida específico (`ClubOnboardingGuard`).



---

### 1.2 Principais Problemas e Vulnerabilidades Técnicas

| Área | Diagnóstico / Problema Encontrado | Impacto Técnico / UX |
| --- | --- | --- |
| **Duplicação de Código** | `modules/onboarding/pages/OnboardingLayout.tsx` e `modules/players/pages/PlayerOnboardingLayout.tsx` duplicam lógicas de cabeçalho, indicador de passos, navegação e botões "Avançar/Voltar".

 | Manutenção custosa, incoerência visual e retrabalho a cada melhoria de design. |
| **Gaps de Schemas & Tipagem** | O módulo geral de onboarding não utiliza schemas do Zod para validar cada etapa (diferente do módulo `auth` ou `players`).

 | Falhas silenciosas de dados, campos incompletos submetidos à API e falta de validação inline instantânea. |
| **Gestão de Rascunhos (Drafts)** | Não há persistência resiliente automática em caso de recarregamento de página ou abandono de sessão. | Frustração do usuário ao perder formulários extensos (especialmente no fluxo de jogadores e organizações). |
| **Pulo de Etapas Não Autorizado** | As etapas são rotas abertas. Se o usuário alterar a URL diretamente para `/review` sem preencher os passos 1 e 2, não há validação estrita que impeça ou redirecione para o primeiro passo pendente. | Inconsistência de integridade dos dados e erros em tempo de execução no `ReviewStep`. |
| **Fragmentação de Guards** | Há dispersão de responsabilidades entre `OnboardingGuard`, `PlayerOnboardingGuard`, `PendingOnboardingRedirect` e `resolvePostAuthRedirect.ts`.

 | Risco de redirecionamentos em loop (*infinite redirect flicker*) durante o carregamento de credenciais assíncronas do Auth. |
| **Desorganização de Pastas** | No módulo de jogadores, parte das páginas de onboarding está na raiz de `pages/` e parte dentro de `pages/onboarding/`.

 | Violação da consistência estrutural do projeto. |

---

# 2. Plano de Refatoração: Onboarding de Alta Performance

O objetivo desta refatoração é transformar os fluxos de onboarding em **Wizards modulares, desacoplados, com salvamento em rascunho automático (auto-save), tipagem ponta a ponta e máquina de estados consistente**.

---

## Fase 1: Arquitetura Compartilhada do Wizard (Design System)

Criar uma infraestrutura reutilizável para qualquer tipo de onboarding (Organização, Clube, Jogador) em `src/modules/shared/components/wizard/` ou `src/components/ui/wizard/`.

### Entregáveis:

1. **`WizardShell.tsx`**: Layout genérico que recebe:
* Lista de passos configurados (`id`, `title`, `description`, `isCompleted`, `isCurrent`, `isOptional`).
* Componente de Stepper visual responsivo (desktop em linha/coluna lateral, mobile compacto com barra de progresso e *counter* `Passo X de Y`).
* Painel de ações padronizado: botão Voltar, botão Salvar Rascunho, botão Avançar/Finalizar e indicador de salvamento (*"Todas as alterações salvas"*).


2. **`WizardStepper.tsx`**: Componente de navegação acessível (ARIA `aria-current="step"`) indicando status visual: *Pendente*, *Atual*, *Concluído* e *Erro*.
3. **`WizardStepGuard.tsx`**: Wrapper de rota que checa se os passos precedentes foram validados antes de renderizar o formulário atual.

---

## Fase 2: Motor de Estado & Persistência de Rascunhos (State Engine)

Implementar uma estratégia unificada de armazenamento temporário combinando **Zustand com persistência no `storage.ts**` (localStorage / sessionStorage) e sincronização assíncrona com a API (draft endpoints).

### Entregáveis:

1. **Criação do `useWizardMachine` (ou `createOnboardingStore`)**:
```typescript
interface WizardState<TData> {
  currentStep: number;
  completedSteps: string[];
  data: Partial<TData>;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  setStep: (stepIndex: number) => void;
  updateData: (partialData: Partial<TData>) => void;
  markStepCompleted: (stepId: string) => void;
  reset: () => void;
}

```


2. **Auto-Save com Debounce**:
* Integrar o hook já existente `useDebounce.ts` para disparar o salvamento em background após 800ms de inatividade no formulário.




3. **Mecanismo de Recuperação de Sessão**:
* Ao entrar no onboarding, verificar se existe um draft não concluído na API ou no cache local. Apresentar um modal amigável: *"Deseja continuar de onde parou?"*.



---

## Fase 3: Padronização dos Módulos Específicos

### 3.1 Módulo `onboarding` (Organização / Tenant)

* Preencher e consolidar as pastas que hoje têm arquivos vazios:


* `src/modules/onboarding/types/onboarding.types.ts`: Tipos do payload de organização, branding e competição inicial.
* `src/modules/onboarding/schemas/onboarding.schemas.ts`: Schemas de validação Zod para cada passo:
* `organizationStepSchema` (Nome, NIF/Registo, Tipo de entidade, Morada, Contacto oficial).
* `brandingStepSchema` (Cores hexadecimais, upload de logotipo com limites de formato/tamanho).
* `competitionStepSchema` (Nome do campeonato de estreia, modalidade, formato, ou opção de pular).


* `src/modules/onboarding/services/onboarding.api.ts`: Funções de comunicação HTTP (`saveDraft`, `getDraft`, `completeOnboarding`).
* `src/modules/onboarding/hooks/useOrganizationOnboarding.ts`: Hook que amarra o store, react-hook-form e TanStack Query mutations.



### 3.2 Módulo `players` (Padronização e Limpeza)

* **Reorganização de arquivos:** Mover todos os arquivos `PlayerOnboarding*Page.tsx` dispersos na raiz de `src/modules/players/pages/` para dentro de `src/modules/players/pages/onboarding/`:


* `pages/onboarding/steps/ProfileStep.tsx`
* `pages/onboarding/steps/IdentityStep.tsx`
* `pages/onboarding/steps/ContactStep.tsx`
* `pages/onboarding/steps/FootballStep.tsx`
* `pages/onboarding/steps/SupplementalStep.tsx`
* `pages/onboarding/steps/ReviewStep.tsx`


* Migrar a validação do `usePlayerOnboardingState.ts` para usar o schema compartilhado `player.schema.ts` e `identity.schema.ts` já existentes no módulo.



### 3.3 Módulo `clubs` (Criação do Wizard de Clubes)

* Desmembrar a página monolítica `ClubOnboardingPage.tsx` em passos orientados:
* Passo 1: Informações Institucionais e Fundação do Clube.
* Passo 2: Estádio / Instalações e Localização.
* Passo 3: Escudo, Cores Oficiais e Identidade.
* Passo 4: Associação à Organização/Liga Regional e Confirmação.



---

## Fase 4: Harmonização de Roteamento, Guards e Ciclo Pós-Autenticação

Eliminar redundâncias e prevenir condições de corrida no roteamento inicial.

### Entregáveis:

1. **Enum Centralizado de Status de Onboarding:**
```typescript
export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  COMPLETED = 'COMPLETED',
}

```


2. **Refatoração do `resolvePostAuthRedirect.ts`:**
* Utilizar uma tabela de decisão orientada a perfis (Role + Tenant Status + OnboardingStatus).


* Se `status !== OnboardingStatus.COMPLETED`, redirecionar deterministicamente para a rota do respectivo módulo (`/onboarding/organization`, `/onboarding/club`, ou `/onboarding/player`).


3. **Consolidação do `OnboardingGuard.tsx`:**
* Tornar o guard inteligente: receber as permissões exigidas e verificar o status atual sem causar tela em branco enquanto os dados do usuário (`useCurrentUser` ou `auth-store`) estão em estado de *loading*. Utilizar o componente já existente `page-skeleton.tsx` durante a verificação de sessão.





---

## Fase 5: Qualidade, Testes e Métricas de Conversão

1. **Testes Unitários e de Integração:**
* Criar testes com Vitest (`src/tests/modules/onboarding/`) validando:
* Disparo de validações de formulário por etapa com dados válidos/inválidos.
* Persistência de dados intermediários no store local.
* Comportamento dos guards ao tentar acessar etapas puladas.




2. **Testes End-to-End (Cypress):**
* Expandir `cypress/e2e/player-onboarding.cy.ts` e criar `cypress/e2e/organization-onboarding.cy.ts` cobrindo o fluxo completo (desde o login até a chegada à Dashboard).




3. **Telemetria de Funil de Onboarding:**
* Adicionar disparos de eventos (Analytics) em cada mudança de etapa (`onboarding_step_viewed`, `onboarding_step_completed`, `onboarding_abandoned`) para identificar possíveis pontos de atrito e gargalos de conversão.



---

# 3. Cronograma Recomendado de Execução

```
[Semana 1] ─── Fase 1 & 2: WizardShell, Stepper, Máquina de Estados e Auto-Save
[Semana 2] ─── Fase 3.1 & 3.2: Refatoração do Onboarding de Organização e Normalização de Jogadores
[Semana 3] ─── Fase 3.3 & 4: Criação do Wizard de Clubes e Harmonização dos Guards de Rotas
[Semana 4] ─── Fase 5: Testes Vitest/Cypress, Auditoria de Acessibilidade (a11y) e Telemetria

```

Essa reestruturação eliminará os arquivos vazios do módulo de onboarding, unificará os três fluxos sob uma mesma linguagem visual e técnica, e garantirá uma experiência segura e moderna para os novos utilizadores da plataforma.