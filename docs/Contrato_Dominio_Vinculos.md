# Contrato de Domínio: Vínculos de Jogadores (Fase 0)

Este documento define as regras de negócio e permissões para o fluxo de vínculo entre jogadores e clubes, servindo como fonte de verdade para a implementação das Fases 1 a 6.

## 1. Regras de Negócio (Contrato de Domínio)

| Regra | Definição | Observação |
| :--- | :--- | :--- |
| **Consentimento** | Todo vínculo exige aceite explícito do jogador. | Proibido criar vínculos "silenciosos". |
| **Origem do Vínculo** | Pedido do Jogador $\rightarrow$ Aprovação do Clube $\rightarrow$ Aceite do Jogador. | O fluxo sempre passa por uma solicitação (`PlayerRegistrationRequest`). |
| **Registro pelo Clube** | Convertido em **Convite**. | O clube não registra o jogador diretamente; ele envia um convite que o jogador deve aceitar. |
| **Unicidade de Vínculo** | **Apenas um vínculo ativo global por jogador.** | Exceção: Jogadores em regime de **empréstimo** (a ser implementado como status/flag específica). |
| **Reenvio** | Pedidos rejeitados podem ser reenviados. | O jogador pode tentar novamente após a rejeição. |
| **Ciclo de Vida** | `PENDING` $\rightarrow$ `APPROVED` $\rightarrow$ `ACTIVE` / `REJECTED` / `CANCELLED` / `EXPIRED`. | Fluxo de estados rigoroso para evitar transições inválidas. |
| **Expiração** | Pedidos pendentes expiram após 30 dias. | Limpeza automática de solicitações obsoletas. |

## 2. Matriz de Permissões

A autorização deve ser baseada explicitamente no `club_id` fornecido na requisição, eliminando seleções implícitas (`.first()`).

| Papel | Solicitar Vínculo | Revisar Pedidos | Aprovar/Rejeitar | Contexto de Validação |
| :--- | :---: | :---: | :---: | :--- |
| **Jogador** | ✅ | ❌ | ❌ | `user_id` do jogador |
| **Adm do Clube** | ❌ | ✅ | ✅ | `ClubMember` ativo no `club_id` solicitado |
| **Adm do Tenant** | ❌ | ✅ | ✅ | `TenantMembership` adm no tenant do `club_id` |
| **Usuário Comum** | ❌ | ❌ | ❌ | N/A |

## 3. Definições de Erros (HTTP Mapping)

- `400 Bad Request`: Erro de validação de dados.
- `403 Forbidden`: Falha na matriz de permissões (ex: adm de clube A tentando acessar clube B).
- `404 Not Found`: Recurso (clube, pedido, jogador) não encontrado.
- `409 Conflict`: Conflito de estado (ex: tentativa de aprovar pedido já rejeitado ou jogador já com vínculo ativo).
