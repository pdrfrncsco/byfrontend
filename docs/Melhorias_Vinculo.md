Vou localizar o fluxo real no backend e no frontend, seguindo a solicitação de vínculo até a aceitação pelo clube. Primeiro vou identificar os pontos de decisão, estados e telas; depois confronto isso com testes e documentação para separar problemas funcionais de oportunidades visuais.

Auditar vínculo de jogadores

Searching for regex `vincul|víncul|link request|join request|membership|solicita.*clube|aceit.*clube|accept.*club|approve.*player` (`**/bybackend/**`)

Searched for regex `vincul|víncul|link request|join request|membership|solicita.*clube|aceit.*clube|accept.*club|approve.*player` (`**/byfrontend/src/**`), 172 results

Searched for regex `vincul|víncul|link request|join request|membership|solicita.*clube|aceit.*clube|accept.*player|approve.*player` (`**/docs/**`), 63 results

Searched for regex `vincul|víncul|link request|join request|membership|solicita.*clube|aceit.*clube|accept.*player|approve.*player` (`**/files/**`), 71 results

Searching for text `PlayerRegistration` (`**/bybackend/**`)

Searching for regex `RegistrationRequest|registration_request|registration-requests|player-requests|link-club` (`**/bybackend/**`)

Searched for regex `PlayerRegistration|registrationRequests|registration-requests|player-requests|linkClub` (`**/byfrontend/src/modules/players/**`), 50 results

Searched for regex `registration|vínculo|link` (`**/bybackend/players/tests/**`), 137 results

Read 

Read 

Read , lines 150 to 230

Read 

Searched for text `class PlayerRegistrationRequest` (`**/bybackend/players/models/**`), 1 result

Searched for text `RegistrationRequest` (`**/bybackend/players/views/**`), 16 results

Searched for text `RegistrationRequest` (`**/bybackend/players/serializers/**`), 6 results

Searched for text `registration-requests|player-registration-requests` (`**/bybackend/players/urls.py`), 1 result

Searched for text `PlayerRegistrationRequest` (`**/bybackend/players/services/**`), 13 results

Searched for text `player-registration-requests` (`**/bybackend/**`), 7 results

Read 

Read 

Read 

Read 

Searched for text `class PlayerRegistration` (`**/bybackend/players/models/**`), 2 results

Searched for regex `def register_player|class PlayerRegistrationService` (`**/bybackend/players/services/**`), 2 results

No matches found. Your search pattern might be excluded completely by either the search.exclude settings or .*ignore files.
If you believe that it should have results, you can check into the .*ignore files and the exclude setting (here are some excluded patterns for reference:[**/node_modules,**/bower_components,**/*.code-search]).
Then if you want to include those files you can call the tool again by setting "includeIgnoredFiles" to true.

No matches found. Your search pattern might be excluded completely by either the search.exclude settings or .*ignore files.
If you believe that it should have results, you can check into the .*ignore files and the exclude setting (here are some excluded patterns for reference:[**/node_modules,**/bower_components,**/*.code-search]).
Then if you want to include those files you can call the tool again by setting "includeIgnoredFiles" to true.

Read 

Read , lines 35 to 70

Read 

Read , lines 220 to 350

Read 

Read 

Read 

Searched for regex `def get_club_for_user|def assert_is_club_admin` (`**/bybackend/clubs/services/**`), 2 results

No matches found. Your search pattern might be excluded completely by either the search.exclude settings or .*ignore files.
If you believe that it should have results, you can check into the .*ignore files and the exclude setting (here are some excluded patterns for reference:[**/node_modules,**/bower_components,**/*.code-search]).
Then if you want to include those files you can call the tool again by setting "includeIgnoredFiles" to true.

Searched for regex `registration request|registration-requests|PlayerRegistrationRequest|Pedidos de vínculo` (`**/byfrontend/**`), 65 results

Read 

Read , lines 425 to 485

Searched for text `PlayerClubLinkRequestPage|ClubPlayerRegistrationRequestsPage|useSubmitRegistrationRequest|useReviewClubPlayerRegistrationRequest` (`**/byfrontend/src/**`), 17 results

Searched for regex `publish_player_registration_created|PlayerRegistrationRequested|registration_request` (`**/bybackend/**`), 35 results

Read , lines 290 to 360

Read , lines 300 to 360

Read , lines 1 to 120

Searched for text `clubRequests|linkRequest` (`**/byfrontend/src/app/providers/I18nProvider.tsx`), 4 results

Searched for regex `ClubPlayerRegisterPage|register player|registar jogador|register_player` (`**/byfrontend/src/modules/players/**`), 3 results

Read , lines 1 to 110

Read 

Read , lines 145 to 205

Searched for regex `register_player|PlayerRegistrationService` (`**/bybackend/players/views/**`), 2 results

No matches found. Your search pattern might be excluded completely by either the search.exclude settings or .*ignore files.
If you believe that it should have results, you can check into the .*ignore files and the exclude setting (here are some excluded patterns for reference:[**/node_modules,**/bower_components,**/*.code-search]).
Then if you want to include those files you can call the tool again by setting "includeIgnoredFiles" to true.

Searched for regex `class PlayerRegistrationRequest|unique.*request|UniqueConstraint` (`**/bybackend/players/migrations/**`), 4 results

Searched for regex `registration-requests|player-registration-requests` (`**/bybackend/**/tests/**`), 5 results

Read 

Searched for regex `class PlayerRegister|RegisterPlayer|registration` (`**/bybackend/players/serializers/**`), 26 results

Searched for text `playerRegisterSchema|useRegisterPlayer` (`**/byfrontend/src/modules/players/**`), 8 results

Searched for regex `error_response|exception_handler|REST_FRAMEWORK` (`**/bybackend/config/**`), 16 results

Searched for files matching `**/byfrontend/**/*test*registration*`, no matches

Read , lines 250 to 309

Read 

Searched for regex `notifications|Notification` (`**/bybackend/notifications/**`), 188 results

Read , lines 55 to 90

Read , lines 120 to 165

Read 

Read , lines 80 to 190

Searched for regex `aria-label|role="|scope=|DataTable` (`**/byfrontend/src/components/ui/**`), 12 results

Read 

Read 

Read , lines 1 to 90

Read 

Execution complete: Executar testes do fluxo de vínculo

Ran terminal command: python bybackend/manage.py test players.tests.test_registration_requests players.tests.test_models --verbosity 1

Searched for regex `class Club|tenant = models.ForeignKey` (`**/bybackend/clubs/models/**`), 10 results

Searched for regex `PlayerRegistrationRequested|PlayerRegistrationCreated|PLAYER_REGISTRATION_CREATED` (`**/docs/**`), 4 results

No matches found. Your search pattern might be excluded completely by either the search.exclude settings or .*ignore files.
If you believe that it should have results, you can check into the .*ignore files and the exclude setting (here are some excluded patterns for reference:[**/node_modules,**/bower_components,**/*.code-search]).
Then if you want to include those files you can call the tool again by setting "includeIgnoredFiles" to true.

Read 

Read 

Execution complete: Verificar tipos do frontend

Ran terminal command: Push-Location byfrontend; npm run type-check; $code=$LASTEXITCODE; Pop-Location; exit $code

A auditor já rastreou o fluxo e encontrou material suficiente para uma avaliação ponta a ponta. Vou ler o relatório consolidado e, em seguida, validar os pontos de maior risco diretamente nos arquivos e nos diagnósticos do workspace antes de transformar isso em um plano executável.

Read , lines 1 to 260

Read , lines 261 to 620

Read , lines 621 to 786

O núcleo do problema está claro: o fluxo feliz funciona, mas há três contratos diferentes competindo entre si: autorização do clube, consentimento do jogador e consistência do vínculo. Vou agora conferir os trechos controladores desses contratos para garantir que o plano ataque as causas, especialmente o `first()` implícito, o registro direto e as transições concorrentes.

Read , lines 1 to 180

Read 

Read 

Read 

A leitura confirma duas falhas de desenho, não apenas de apresentação: a permission class autoriza “algum clube” e o serviço escolhe outro implicitamente; além disso, a página impede novos pedidos quando existe `current_club`, enquanto o modelo/constraint sugerem uma política potencialmente mais ampla. Vou fechar a auditoria com o caminho alternativo do clube, as views de revisão e o estado dos testes.

Searched for regex `register_player|PlayerRegistrationService|PlayerRegistrationRequestService` (`**/bybackend/players/**/*.py`), 23 results

Read 

Read 

Read 

Read , lines 250 to 309

Read , lines 240 to 370

Read 

Read 

**Resultado da auditoria**

O fluxo feliz está implementado:

1. O jogador envia um pedido.
2. O clube consulta os pedidos.
3. Um gestor aprova ou rejeita.
4. A aprovação cria `PlayerRegistration`.

Os testes existentes cobrem esses cenários básicos, mas o desenho atual possui riscos relevantes em autorização, consentimento, concorrência e feedback visual.

## Achados prioritários

### P0/P1: clube resolvido implicitamente

A permissão `__init__.py` permite acesso quando o usuário é administrador de qualquer clube ou tenant. Depois, `club_service.py` usa `get_club_for_user()`, que seleciona o primeiro clube encontrado.

Isso cria dois problemas:

- um administrador de múltiplos clubes pode operar no clube errado;
- um administrador de tenant pode passar pela permission class e falhar numa validação posterior.

O endpoint precisa receber o contexto explicitamente, por exemplo:

```text
/clubs/{club_id}/player-registration-requests/
```

A autorização deve validar:

- `ClubMember` ativo no clube informado; ou
- `TenantMembership` administrativa no tenant daquele clube;
- clube ativo e pertencente ao contexto permitido.

O uso de `first()` deve ser removido de operações administrativas.

### P1: registro direto do clube ignora o consentimento

O fluxo em `__init__.py` chama diretamente `PlayerRegistrationService.register_player()`. Assim, o clube pode criar um vínculo sem existir `PlayerRegistrationRequest`.

Isso contradiz a tela byfrontend/src/modules/players/pages/PlayerClubRegisterPage.tsx e a documentação que tratam o vínculo como iniciado pelo jogador.

Recomendação: transformar o registro direto em um convite criado pelo clube, com aceite explícito do jogador. Isso preserva a necessidade operacional do clube sem criar um vínculo silenciosamente.

Uma exceção administrativa só deveria existir com:

- permissão específica;
- motivo obrigatório;
- auditoria;
- notificação ao jogador;
- política documentada.

### P1: competição não é validada por contexto

O backend aceita `competition_id` e faz apenas uma busca por ID. Não valida se a competição:

- pertence ao mesmo tenant;
- está associada ao clube;
- está ativa;
- está dentro da temporada ou período permitido.

As telas `PlayerClubLinkRequestPage.tsx` e `ClubPlayerRegisterPage.tsx` também expõem um UUID livre ao usuário.

A competição deve ser carregada a partir do clube selecionado e apresentada em um `Select` com nome, temporada, status e datas.

### P1: deduplicação não é segura contra concorrência

Em `player_registration_request_service.py`, a sequência `exists()` seguida de `create()` não impede duas requisições simultâneas.

A solução deve combinar:

- constraint de banco para pedido pendente;
- tratamento de `IntegrityError`;
- resposta idempotente ou conflito `409`;
- testes concorrentes.

A semântica para pedidos sem competição precisa ser definida separadamente, pois `NULL` pode permitir duplicatas dependendo do banco.

### P1: aprovação concorrente

`review_request()` verifica o status antes de salvar, mas não bloqueia o pedido com `select_for_update()`.

Duas aprovações podem iniciar simultaneamente. A aprovação deve:

- bloquear o pedido;
- revalidar `pending` dentro da transação;
- criar o registro;
- mudar o estado do pedido;
- retornar conflito claro quando já houver decisão.

### P1: regra do serviço diverge da constraint

O modelo aparenta permitir múltiplos vínculos por combinação de jogador, clube e competição, mas `PlayerRegistrationService.register_player()` rejeita qualquer vínculo ativo do jogador, independentemente de clube ou competição.

É necessário decidir formalmente entre:

- um único vínculo ativo global;
- múltiplos vínculos por competição;
- um vínculo principal mais empréstimos;
- regras diferentes para registro e competição.

Essa decisão deve preceder a alteração da constraint ou dos serviços.

## Problemas de UX, visual e acessibilidade

- UUID de competição digitado manualmente.
- Seleção de clube sem `aria-pressed`.
- Campo de observações sem `label` associado em `ClubPlayerRegistrationRequestsPage.tsx`.
- Falta de estados de erro e ação de retry para queries.
- Jogador pode continuar vendo o pedido como pendente após aprovação.
- Textos hardcoded em português apesar do uso de i18n.
- Painel do clube sem filtro por status, contador de pendências ou ordenação operacional.
- Aprovação e rejeição ocorrem na mesma linha, com pouca informação contextual.
- Não há representação clara de histórico, data de revisão, responsável e motivo.

## Plano de refatoração

### Fase 0: decisões de domínio

Definir antes do código:

- se todo vínculo exige aceite do jogador;
- se o registro direto será removido ou convertido em convite;
- quantos vínculos ativos um jogador pode possuir;
- se pedidos rejeitados podem ser reenviados;
- se haverá expiração ou cancelamento;
- quais papéis podem revisar pedidos;
- quais estados são oficiais.

**Saída:** contrato de domínio documentado e matriz de permissões.

### Fase 1: contexto e autorização

Arquivos principais:

- `__init__.py`
- `club_service.py`
- `player_registration_request_views.py`
- `urls.py`

Implementar:

- `club_id` explícito na rota;
- seletor de clube autorizado;
- autorização centralizada por clube e tenant;
- remoção da dependência de `get_club_for_user()` nesse fluxo;
- alinhamento entre papéis aceitos no frontend e backend.

**Critérios de aceite:**

- administrador de um clube não acessa outro;
- administrador de tenant atua apenas dentro do próprio tenant;
- múltiplos clubes nunca resultam em seleção implícita;
- respostas de autorização são consistentes.

### Fase 2: pedido como única porta de entrada

Arquivos principais:

- `__init__.py`
- `__init__.py`
- `player_registration_request_service.py`
- `ClubPlayerRegisterPage.tsx`

Implementar:

- convite do clube em vez de registro direto;
- aceite ou recusa pelo jogador;
- auditoria do autor, motivo e timestamps;
- bloqueio de criação direta sem precondição válida;
- migração ou compatibilidade para registros históricos.

### Fase 3: integridade de competição e datas

Implementar:

- endpoint de competições permitidas por clube;
- filtro por tenant, clube, status e temporada;
- validação de `joined_date` no frontend e backend;
- validação de janela da competição;
- mensagens de erro específicas;
- remoção do campo UUID livre.

### Fase 4: idempotência e máquina de estados

Arquivos principais:

- `player_registration_request.py`
- `player_registration_request_service.py`
- `registration.py`

Implementar:

- constraint para pedidos pendentes;
- `select_for_update()` durante revisão;
- transições condicionais;
- exceções de domínio, como `RequestAlreadyReviewed` e `RegistrationConflict`;
- mapeamento HTTP:
  - `400` para validação;
  - `403` para autorização;
  - `404` para recurso inexistente;
  - `409` para conflito de estado ou duplicata;
  - `500` para falha inesperada;
- logs estruturados com request ID, usuário, clube, tenant, estado anterior e novo estado.

### Fase 5: eventos e notificações

Adicionar eventos para:

- pedido submetido;
- pedido aprovado;
- pedido rejeitado;
- convite criado;
- convite aceito ou recusado.

O evento deve ser publicado depois da decisão persistida, sem permitir que falha de notificação desfaça a transação principal.

No frontend:

- invalidar o perfil do jogador após aprovação;
- atualizar pedidos do clube;
- adicionar polling ou atualização por notificações;
- exibir contador de pedidos pendentes.

### Fase 6: refatoração visual

Na tela do jogador:

- seleção de clube com estado acessível;
- seleção de competição contextual;
- resumo visual antes do envio;
- confirmação clara de que o pedido será enviado ao clube;
- status com legenda textual e data da última atualização;
- estado de erro com retry;
- mensagens totalmente traduzidas.

Na tela do clube:

- filtro por `Pendente`, `Aprovado` e `Rejeitado`;
- contador de pendências;
- ordenação por prioridade e data;
- painel ou modal de revisão;
- resumo do jogador, competição e data solicitada;
- motivo obrigatório para rejeição;
- confirmação antes de aprovar;
- estado de processamento por linha, em vez de bloquear todas as ações;
- labels acessíveis e foco consistente.

O visual deve continuar compatível com os componentes existentes, mas com uma hierarquia mais operacional: pendências primeiro, histórico separado e ações de revisão mais explícitas.

## Cobertura mínima de testes

Backend:

- usuário de outro clube;
- tenant admin fora do tenant;
- múltiplos clubes;
- competição de outro tenant;
- competição incompatível com o clube;
- jogador com vínculo ativo;
- menor sem consentimento;
- duplicata serializada;
- duplicata concorrente;
- duas aprovações concorrentes;
- aprovação após rejeição;
- rejeição após aprovação;
- reenvio após rejeição;
- falha de integridade;
- autorização do convite e aceite do jogador.

Frontend:

- seleção de clube e competição;
- submissão com erro e retry;
- estados `pending`, `approved` e `rejected`;
- aprovação e rejeição com confirmação;
- motivo obrigatório para rejeição;
- navegação por teclado;
- atributos ARIA;
- tradução;
- atualização do status após revisão.

E2E prioritário:

```text
jogador envia pedido
  -> clube recebe pedido
  -> clube aprova
  -> jogador vê aprovação
  -> registro ativo aparece no perfil
```

**Ordem recomendada:** Fase 0, Fase 1 e Fase 2 devem vir antes da melhoria visual. Sem fechar autorização e consentimento, uma interface mais clara apenas tornaria um contrato de negócio inconsistente mais fácil de usar.