Arquitetura do Modulo PLAYER - **Global Player Profile + Football Registration + Career + Contracts + Transfer + Performance + Compliance**.

---

# 1. Conceito: Global Player

O conceito central deve ser:

```text
                    GLOBAL PLAYER
                          │
          ┌───────────────┼────────────────┐
          │               │                │
       Identity        Football          Account
          │             Identity            │
          │               │                │
     Personal Data    Registration       Authentication
     Documents       Career              Permissions
     Biometrics*     Club History        Preferences
     Contacts        Transfers           Security
```

O `Player` **não deve ser criado novamente quando muda de clube**.

O jogador possui um **Global Player ID** permanente.

Exemplo:

```text
Player ID
BY-PLY-01HXYZ...
```

E depois:

```text
2021 → Clube A
2022 → Clube B
2023 → Clube C
2024 → Clube D
```

Não são quatro jogadores.

É:

```text
PLAYER
  │
  ├── Registration #1 → Clube A
  ├── Registration #2 → Clube B
  ├── Registration #3 → Clube C
  └── Registration #4 → Clube D
```

Isso é fundamental para o Bolayetu.

---

# 2. Relação com FIFA Connect

Eu **não chamaria o nosso identificador de `FIFA ID`**.

Criaria:

```text
player.global_id
```

E, quando existir integração oficial:

```text
player.external_ids

fifa_connect_id
fifa_id
national_association_id
league_id
club_registration_id
```

Porque o FIFA Connect prevê um identificador global para stakeholders e integração entre sistemas de associações. ([support.tickets.fifa.com][3])

Assim o Bolayetu pode futuramente integrar:

```text
Bolayetu
   │
   ├── FIFA Connect
   ├── Federação
   ├── Liga
   ├── Clubes
   └── outros sistemas
```

sem alterar o modelo principal.

---

# 3. O ciclo completo do Player

Eu estruturaria o lifecycle assim:

```text
DISCOVERY
   ↓
INVITATION
   ↓
ACCOUNT CREATION
   ↓
PLAYER ONBOARDING
   ↓
IDENTITY VERIFICATION
   ↓
PLAYER PROFILE
   ↓
FOOTBALL REGISTRATION
   ↓
CLUB ASSOCIATION
   ↓
COMPETITION REGISTRATION
   ↓
SPORTING ACTIVITY
   ↓
CONTRACT
   ↓
PERFORMANCE
   ↓
TRANSFER REQUEST
   ↓
RELEASE
   ↓
OUTBOARDING
   ↓
NEW CLUB
   ↓
NEW REGISTRATION
```

Mas existe uma distinção fundamental:

> **Outboarding não significa apagar ou encerrar o Player.**

Significa encerrar o vínculo com determinado clube.

---

# 4. Onboarding

O onboarding deve ter duas possibilidades.

## A. Jogador cria a própria conta

```text
Landing
 ↓
Criar conta
 ↓
Escolher "Sou Jogador"
 ↓
Email/Telefone
 ↓
Verificação
 ↓
Criar perfil
```

## B. Clube convida jogador

```text
Club Admin
     ↓
Invite Player
     ↓
Email / telefone
     ↓
Player accepts
     ↓
Account created
     ↓
Player claims profile
```

## C. Organização registra jogador

```text
Organization
      ↓
Register Player
      ↓
Identity verification
      ↓
Player profile
      ↓
Club association
```

---

# 5. Step 1 — Account

Primeiro não pedimos 80 campos.

```text
Email
Telefone
Password
Country
Language
Consent
```

Depois:

```text
Verify email
Verify phone
```

---

# 6. Step 2 — Identity

### Dados pessoais

```text
first_name
middle_name
last_name

preferred_name

date_of_birth

place_of_birth

country_of_birth

nationality

secondary_nationality

gender

marital_status*
```

`marital_status` eu deixaria opcional porque não é essencial para a operação futebolística.

---

# 7. Identificação civil

```text
document_type

document_number

issuing_country

issuing_authority

issue_date

expiry_date

document_front

document_back
```

Tipos:

```text
National ID
Passport
Birth Certificate
Residence Permit
Other
```

**Não utilizar BI angolano como campo universal.**

O modelo deve ser internacional:

```text
IdentityDocument
```

---

# 8. Dados de contacto

```text
primary_email

secondary_email

mobile_phone

secondary_phone

country_code

address

city

province/state

postal_code

country
```

---

# 9. Contacto de emergência

```text
emergency_contact

name

relationship

phone

email

country
```

---

# 10. Dados de responsável legal

Especialmente importante para menores.

```text
LegalGuardian

name

relationship

document

phone

email

address

consent_status
```

A arquitetura precisa suportar menores desde o início.

Isso é especialmente importante porque o regime internacional de transferências de menores possui restrições e procedimentos específicos; a FIFA publicou uma nova edição do guia de pedidos para menores em fevereiro de 2026. ([Inside FIFA][4])

---

# 11. Step 3 — Football Identity

Agora começa o verdadeiro Player Profile.

```text
player_id

registration_number

football_position

secondary_positions

dominant_foot

height

weight

nationality

sporting_status
```

Posições:

```text
Goalkeeper

Centre Back

Left Back

Right Back

Defensive Midfielder

Central Midfielder

Attacking Midfielder

Left Winger

Right Winger

Second Striker

Centre Forward
```

O modelo deve permitir posições múltiplas.

---

# 12. Player Profile

O perfil público:

```text
Profile Photo

Cover Photo

Full Name

Known As

Nationality

Position

Club

Number

Height

Preferred Foot
```

E:

```text
Biography

Career Summary

Statistics

Achievements

Clubs

Competitions

Media
```

---

# 13. Player Medical

Aqui eu faria uma separação muito importante.

Dados médicos **não devem ser públicos por padrão**.

Criaria:

```text
PlayerMedicalProfile
```

com:

```text
blood_type

medical_status

injury_status

medical_clearance

fitness_status

medical_notes

last_medical_exam

next_medical_exam
```

E documentos:

```text
MedicalDocument
```

com:

```text
type

file

issued_at

expires_at

verified_by

verification_status
```

Acesso:

```text
Player
Club Medical Staff
Authorized Organization
```

Não:

```text
Public
Fan
Other Clubs
```

---

# 14. Player Documents

Criaria um módulo documental próprio.

```text
PlayerDocument
```

Categorias:

```text
Identity

Registration

Contract

Medical

Insurance

Visa

Work Permit

Education

Transfer

Legal

Other
```

Cada documento:

```text
id

player

type

title

file

issuer

issue_date

expiry_date

verification_status

verified_by

verified_at

visibility

created_at
```

---

# 15. Football Registration

Este é um dos objetos mais importantes.

Não colocar:

```text
player.club_id
```

diretamente no Player.

Criar:

```text
PlayerRegistration
```

Exemplo:

```text
Player
   │
   ├── Registration
   │      Club A
   │      2022-01-01 → 2022-12-31
   │
   ├── Registration
   │      Club B
   │      2023-01-01 → 2024-01-31
   │
   └── Registration
          Club C
          2024-02-01 → current
```

---

# 16. PlayerRegistration

Campos:

```text
id

player_id

club_id

organization_id

competition_id

season_id

registration_number

registration_type

status

registration_date

effective_from

effective_until

shirt_number

squad_number

eligibility_status

registration_document

approved_by

approved_at
```

Tipos:

```text
Amateur

Professional

Youth

Academy

Loan

Trial

Guest

Other
```

---

# 17. Career History

Nunca depender apenas dos `PlayerRegistration`.

Criar:

```text
PlayerCareer
```

Com:

```text
player

club

team

season

competition

position

appearances

starts

minutes

goals

assists

yellow_cards

red_cards
```

Assim podemos reconstruir a carreira.

---

# 18. Club Association

A associação:

```text
Player ↔ Club
```

deve ser temporal.

```text
ACTIVE

PENDING

SUSPENDED

LOANED

RELEASED

TRANSFERRED

RETIRED
```

---

# 19. Contract

Contrato é uma entidade independente.

```text
PlayerContract
```

Campos:

```text
id

player

club

contract_type

status

start_date

end_date

signed_date

salary

currency

bonuses

release_clause

image_rights

option_year

termination_clause

document

signed_by_player

signed_by_club

verified_at
```

---

# 20. Contract Types

```text
Professional

Youth

Amateur

Short Term

Trial

Loan

Extension
```

---

# 21. Agent

O Player pode ter um agente.

```text
PlayerAgentRelationship
```

```text
player

agent

representation_agreement

start_date

end_date

status

commission

document
```

É importante separar **Agent** de **User**.

Um agente é uma entidade de negócio.

A conta de autenticação é outra coisa.

As regras da FIFA para agentes estabelecem requisitos para representation agreements, incluindo partes, duração, fee, natureza dos serviços e assinaturas. ([legal.fifa.com][5])

---

# 22. Transfer

Transferência também é uma entidade própria.

```text
Transfer
```

```text
player

from_club

to_club

transfer_type

status

requested_at

approved_at

effective_date

registration_date

transfer_fee

currency

loan_fee

documents
```

Tipos:

```text
Permanent

Loan

Free Transfer

Return From Loan

Youth Transfer

International Transfer

Domestic Transfer
```

---

# 23. Transfer Workflow

```text
PLAYER / NEW CLUB
       ↓
Transfer Request
       ↓
Current Club
       ↓
Release
       ↓
Association / League
       ↓
Registration
       ↓
New Club
       ↓
Player Active
```

Estados:

```text
DRAFT

REQUESTED

PENDING_RELEASE

RELEASE_APPROVED

PENDING_REGISTRATION

UNDER_REVIEW

APPROVED

REJECTED

CANCELLED

COMPLETED
```

---

# 24. Electronic Player Passport

O Bolayetu deve possuir uma abstração para:

```text
ElectronicPlayerPassport
```

Não tentar replicar ou substituir o EPP oficial da FIFA.

Mas manter dados estruturados suficientes para futura integração.

```text
player

registration_history

training_clubs

registration_periods

transfer_history

professional_registration_date
```

Isto é particularmente importante porque o EPP da FIFA usa o histórico de registo desde os 12 anos e participa no cálculo/distribuição de training rewards. ([legal.fifa.com][2])

---

# 25. Training History

Criaria:

```text
PlayerTrainingHistory
```

```text
player

club

academy

start_date

end_date

country

training_category

verified
```

Isso prepara o Bolayetu para:

```text
Training Compensation

Solidarity Contribution
```

A FIFA distingue precisamente training compensation e solidarity contribution como mecanismos de recompensa aos clubes envolvidos na formação. ([Inside FIFA][6])

---

# 26. Competition Registration

Um jogador pode estar associado a uma competição.

```text
CompetitionPlayerRegistration
```

```text
player

competition

season

club

registration_date

eligibility

status

shirt_number
```

Isso permite:

```text
Player
   ↓
Club
   ↓
Competition
   ↓
Season
```

---

# 27. Match Participation

Nunca colocar estatísticas diretamente no Player.

Criar:

```text
MatchPlayerParticipation
```

```text
match

player

club

started

minutes_played

position

goals

assists

yellow_cards

red_cards

substituted_in

substituted_out
```

---

# 28. Player Statistics

Depois podemos agregar:

```text
PlayerSeasonStatistics
```

```text
season

competition

club

appearances

starts

minutes

goals

assists

shots

shots_on_target

passes

pass_accuracy

key_passes

tackles

interceptions

clearances

duels

fouls

yellow_cards

red_cards
```

Mas o modelo deve permitir estatísticas específicas por competição.

---

# 29. Performance

Criaria:

```text
PlayerPerformanceMetric
```

Exemplo:

```text
speed

distance

sprints

acceleration

heart_rate

workload

training_load
```

Mas estes dados devem ser tratados como **performance data**, não simplesmente como atributos do jogador.

---

# 30. Achievements

```text
PlayerAchievement
```

```text
title

competition

club

season

date

description

certificate
```

Exemplos:

```text
Champion

Top Scorer

Best Player

Best Young Player

Cup Winner

International Appearance
```

---

# 31. National Team

Criaria:

```text
NationalTeamCallUp
```

```text
player

national_team

category

competition

call_up_date

release_date

caps

status
```

E:

```text
NationalTeamAppearance
```

---

# 32. Media

O Player deve possuir:

```text
PlayerMediaProfile
```

Ligado ao sistema global:

```text
MediaAsset
```

Tipos:

```text
Profile Photo

Gallery

Match Photo

Training Photo

Video

Highlight

Interview

Document
```

E o armazenamento deve seguir a arquitetura Cloudflare R2/CDN que já definimos.

---

# 33. Social Profiles

Opcional:

```text
PlayerSocialProfile
```

```text
instagram

facebook

x

youtube

tiktok

website
```

Mas esses campos devem ser tratados como **links externos**, não como autenticação.

---

# 34. Privacy

Criaria:

```text
PlayerPrivacySettings
```

Permissões por categoria:

```text
Public

Club

Organization

Competition

Agent

Player Only

Private
```

Exemplo:

| Informação       | Público |              Clube |        Organização |
| ---------------- | ------: | -----------------: | -----------------: |
| Nome             |       ✓ |                  ✓ |                  ✓ |
| Foto             |       ✓ |                  ✓ |                  ✓ |
| Estatísticas     |       ✓ |                  ✓ |                  ✓ |
| Contrato         |       — |                  ✓ | conforme permissão |
| Salário          |       — |           restrito |           restrito |
| Documento        |       — |           restrito |           restrito |
| Dados médicos    |       — |  médico autorizado |         autorizado |
| Contacto pessoal |       — | conforme permissão | conforme permissão |

---

# 35. Outboarding

Este processo precisa ser extremamente bem desenhado.

Quando o jogador deixa um clube:

```text
Player
   ↓
Request Release
   ↓
Club Review
   ↓
Documents
   ↓
Contract Check
   ↓
Financial Clearance
   ↓
Release
```

Depois:

```text
Player Status

FREE_AGENT
```

ou:

```text
TRANSFER_PENDING
```

ou:

```text
LOAN_RETURN
```

O histórico permanece.

---

# 36. Nunca apagar o Player

Esta regra deve estar na arquitetura:

```text
❌ DELETE Player
```

Em vez disso:

```text
Player.status

ACTIVE

INACTIVE

RETIRED

DECEASED
```

E a relação com o clube:

```text
PlayerClubRelationship.status
```

pode terminar.

---

# 37. Modelo Backend — Django

Eu estruturaria aproximadamente assim:

```text
players/
│
├── models/
│   ├── player.py
│   ├── identity.py
│   ├── document.py
│   ├── guardian.py
│   ├── registration.py
│   ├── career.py
│   ├── contract.py
│   ├── agent.py
│   ├── transfer.py
│   ├── training.py
│   ├── competition.py
│   ├── participation.py
│   ├── statistics.py
│   ├── achievement.py
│   ├── national_team.py
│   ├── medical.py
│   ├── media.py
│   ├── privacy.py
│   └── external_id.py
│
├── services/
│   ├── onboarding.py
│   ├── registration.py
│   ├── transfer.py
│   ├── release.py
│   ├── contract.py
│   ├── verification.py
│   └── career.py
│
├── selectors/
│
├── serializers/
│
├── views/
│
├── permissions/
│
├── validators/
│
├── events/
│
├── tasks/
│
├── admin/
│
├── tests/
│
└── urls.py
```

---

# 38. Entidade principal

Conceitualmente:

```python
Player
```

não deve conter tudo.

Ela deve ser relativamente pequena:

```text
Player
├── global_id
├── account
├── status
├── first_name
├── last_name
├── preferred_name
├── date_of_birth
├── nationality
├── profile_photo
├── primary_position
├── dominant_foot
└── created_at
```

E o restante fica nas entidades especializadas.

Isso evita criar um **God Model** com 150 campos.

---

# 39. Frontend — Player Portal

Eu criaria:

```text
/features/player/
```

```text
player/
│
├── components/
│
├── pages/
│
├── hooks/
│
├── services/
│
├── schemas/
│
├── types/
│
├── store/
│
├── constants/
│
└── routes.ts
```

---

# 40. Player Onboarding UI

O onboarding deve ser um wizard:

```text
01 Account
      ↓
02 Identity
      ↓
03 Personal
      ↓
04 Football
      ↓
05 Contact
      ↓
06 Guardian*
      ↓
07 Documents
      ↓
08 Medical*
      ↓
09 Club
      ↓
10 Review
      ↓
11 Submit
```

O `*` depende da idade/permissão.

---

# 41. Player Dashboard

Depois do onboarding:

```text
PLAYER DASHBOARD
```

KPIs:

```text
Current Club

Current Season

Matches

Goals

Assists

Minutes

Market/Profile Status
```

Widgets:

```text
Upcoming Matches

Recent Performance

Career Timeline

Contract

Notifications

Documents

Media

Transfer Status
```

---

# 42. Player Navigation

```text
Dashboard

My Profile

Career

Statistics

Matches

Training

Contracts

Transfers

Documents

Media

Achievements

National Team

Agent

Notifications

Settings
```

---

# 43. Player Profile

Estrutura:

```text
HEADER

Photo
Name
Position
Club
Nationality
Number

TABS

Overview
Career
Statistics
Matches
Media
Achievements
Documents
```

---

# 44. Career Timeline

Visualmente:

```text
2026
│
├── Clube A
│   └── Premier League
│
2025
│
├── Clube B
│   └── National League
│
2024
│
├── Clube C
│
2022
│
└── Academy
```

Esta será uma das telas mais importantes do Player Global.

---

# 45. Transfer Center

O jogador deverá conseguir visualizar:

```text
Current Club

Transfer Status

Previous Clubs

Transfer Requests

Offers

Agent

Documents

Release Status
```

---

# 46. Player Marketplace

Futuramente:

```text
Player Profile
      ↓
Visibility
      ↓
Scouts
      ↓
Clubs
      ↓
Agents
      ↓
Offers
```

Mas o jogador controla a exposição.

---

# 47. Player Permissions

O sistema deve trabalhar com:

```text
Player

Club Admin

Coach

Medical Staff

Organization Admin

Competition Admin

Agent

Scout

Platform Admin
```

Cada um vê uma parte diferente.

---

# 48. Eventos do domínio

O módulo deverá emitir eventos como:

```text
PlayerCreated

PlayerOnboardingCompleted

PlayerVerified

PlayerDocumentUploaded

PlayerDocumentVerified

PlayerRegistrationCreated

PlayerRegistrationApproved

PlayerContractSigned

PlayerContractRenewed

PlayerTransferRequested

PlayerReleased

PlayerTransferred

PlayerLoanStarted

PlayerLoanEnded

PlayerCompetitionRegistered

PlayerMatchParticipationRecorded

PlayerRetired
```

Isto encaixa diretamente na arquitetura **Events & Workflows** que já definimos.

---

# 49. Workflow completo

O ciclo final seria:

```text
                    ┌──────────────┐
                    │    PLAYER    │
                    └──────┬───────┘
                           │
                    CREATE ACCOUNT
                           │
                           ▼
                     ONBOARDING
                           │
                           ▼
                  IDENTITY VERIFICATION
                           │
                           ▼
                    PLAYER PROFILE
                           │
                           ▼
                   CLUB ASSOCIATION
                           │
                           ▼
                  PLAYER REGISTRATION
                           │
                           ▼
                     CONTRACT
                           │
                           ▼
                COMPETITION ELIGIBILITY
                           │
                           ▼
                     MATCHES
                           │
                           ▼
                   PERFORMANCE
                           │
                           ▼
                  CAREER HISTORY
                           │
                           ▼
                 TRANSFER REQUEST
                           │
                           ▼
                    CLUB RELEASE
                           │
                           ▼
                  REGISTRATION CLOSED
                           │
                           ▼
                     FREE AGENT
                           │
                           ▼
                     NEW CLUB
                           │
                           ▼
                  NEW REGISTRATION
                           │
                           ▼
                    NEW CONTRACT
```

O ponto fundamental é que **o Player permanece o mesmo durante todo o ciclo**.

---

# 50. A arquitetura de domínio que eu adotaria

No final, teríamos:

```text
                         PLAYER
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
   IDENTITY             ACCOUNT             PROFILE
       │
       ├── Documents
       ├── Guardians
       └── External IDs

                           │
                    FOOTBALL IDENTITY
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
    CAREER             REGISTRATION         TRAINING
       │                   │                    │
       │                   └── Competition      │
       │                                       │
       └── Clubs / Seasons                     │
                                               │
                         CONTRACTS
                            │
                         AGENTS
                            │
                         TRANSFERS
                            │
                         MATCHES
                            │
                       STATISTICS
                            │
                       PERFORMANCE
                            │
                        ACHIEVEMENTS
                            │
                       NATIONAL TEAM
                            │
                          MEDIA
                            │
                        DOCUMENTS
                            │
                         PRIVACY
```

## E uma decisão arquitetural importante

Eu **não implementaria tudo isso de uma vez**.

Para o novo Bolayetu, faria o módulo Player em **quatro releases**:

### Player V1 — Identity

```text
Account
Identity
Profile
Documents
Guardian
Onboarding
Verification
```

### Player V2 — Football

```text
Club Association
Registration
Career
Competition
Season
Match Participation
Statistics
```

### Player V3 — Professional

```text
Contracts
Agents
Transfers
Loans
Release
Training History
Electronic Player Passport abstraction
```

### Player V4 — Ecosystem

```text
Performance
Medical
Media
National Team
Marketplace
Scouting
Analytics
Offers
AI Profile
```

Essa separação é importante porque o **Player Global será provavelmente uma das entidades centrais do Bolayetu**. Se o modelo for bem construído desde V1, podemos acrescentar Clubes, Competições, Transferências e Marketplace posteriormente sem reconstruir a identidade do jogador.

E, para a camada de interoperabilidade, eu deixaria desde já `external_ids`, `registration_history` e `training_history` preparados para integração futura. Isso está alinhado com a direção do FIFA Connect e com a necessidade de sistemas eletrónicos de registo e transferência manterem dados completos e confiáveis para o ecossistema internacional. ([Inside FIFA][1])

**Nota regulatória:** isto é uma arquitetura de produto inspirada em padrões internacionais, não uma implementação oficial de FIFA Connect/TMS/EPP. Além disso, a FIFA já aprovou um novo quadro do RSTP que entra em vigor em **1 de janeiro de 2027**, portanto as regras de transferências, contratos e compliance devem ser modeladas de forma configurável, e não codificadas como regras imutáveis. ([rusecure.fifa.com][7])
