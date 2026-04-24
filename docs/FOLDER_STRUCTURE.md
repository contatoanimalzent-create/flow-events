# FOLDER STRUCTURE

## Principio Estrutural

A estrutura oficial do projeto deve seguir o negócio, não a tecnologia. O objetivo é permitir que cada domínio evolua com autonomia, sem espalhar regra crítica em `pages`, `components` e `lib` de forma difusa.

Essa organização foi desenhada para:

- escalar o produto sem reescrever base;
- permitir ownership claro por domínio;
- reduzir acoplamento entre times e módulos;
- manter UI, data layer e regras de negócio próximas;
- suportar o crescimento do Animalz Events para uma plataforma global.

## Estrutura Completa Do Projeto

```txt
src/
  app/
    bootstrap/
    config/
    layouts/
    providers/
    routes/
    guards/
    app.tsx
    main.tsx

  features/
    events/
      components/
      hooks/
      services/
      types/
      schemas/
      utils/
      pages/
      constants/
      index.ts

    tickets/
      components/
      hooks/
      services/
      types/
      schemas/
      utils/
      pages/
      constants/
      index.ts

    checkin/
      components/
      hooks/
      services/
      types/
      schemas/
      utils/
      pages/
      constants/
      index.ts

    staff/
      components/
      hooks/
      services/
      types/
      schemas/
      utils/
      pages/
      constants/
      index.ts

    financial/
      components/
      hooks/
      services/
      types/
      schemas/
      utils/
      pages/
      constants/
      index.ts

    growth/
      components/
      hooks/
      services/
      types/
      schemas/
      utils/
      pages/
      constants/
      index.ts

  shared/
    ui/
    components/
    hooks/
    services/
    types/
    contracts/
    utils/
    constants/
    styles/

  integrations/
    supabase/
      client.ts
      auth.ts
      db.types.ts
      repositories/
      realtime/
      storage/
    payments/
      stripe/
    analytics/
    notifications/
    monitoring/

  infra/
    env/
    auth/
    query/
    permissions/
    feature-flags/
    errors/
    logging/
    cache/

  assets/
  styles/
  tests/
```

## Separacao Por Domínio

### `/features/events`

Responsável por todo o ciclo de vida do evento:

- draft, publicação e despublicacao;
- agenda, venue, capacidade e identidade;
- status operacional;
- configurações base do evento.

### `/features/tickets`

Responsável pela operação comercial:

- ticket types e lotes;
- estoque e regras de venda;
- vouchers, desconto e upsell;
- pedido, emissão, transferência e cancelamento;
- checkout e conciliacao do funil de compra.

### `/features/checkin`

Responsável pela operação de acesso:

- leitura de QR;
- válidação de ingresso;
- gate, fila e status de entrada;
- auditoria de operador, dispositivo e horario;
- tratamento de exceção operacional.

### `/features/staff`

Responsável pela estrutura de equipe:

- perfis operacionais;
- escalas e alocacao por área;
- credenciais e permissões de campo;
- responsabilidade por tarefa ou posto.

### `/features/financial`

Responsável pela unidade econômica do evento:

- resumo financeiro por evento e organização;
- taxas, repasses, custos e margem;
- conciliacao;
- chargeback, reembolso e fechamento;
- caixa, PDV e visão gerencial.

### `/features/growth`

Responsável por aquisição, retenção e inteligência comercial:

- campanhas e canais;
- cupons e afiliacao;
- segmentos e automações;
- funis, cohorts e atribuicao;
- recomendações e sinais de receita.

## Onde Ficam Components, Hooks, Services E Types

### `components`

Componentes que conhecem o domínio vivem dentro da própria feature.

Exemplos:

- `features/events/components/event-status-badge.tsx`
- `features/checkin/components/checkin-scanner.tsx`
- `features/financial/components/settlement-card.tsx`

Componentes realmente genericos vao para `shared/ui` ou `shared/components`.

### `hooks`

Hooks de dados e composicao ficam perto da feature.

Exemplos:

- `features/tickets/hooks/use-ticket-types-query.ts`
- `features/events/hooks/use-publish-event-mutation.ts`
- `features/growth/hooks/use-campaign-performance-query.ts`

Hooks compartilhados, sem regra de negócio, ficam em `shared/hooks`.

### `services`

Services ficam dentro do domínio quando representam caso de uso do domínio.

Exemplos:

- `features/events/services/events.service.ts`
- `features/tickets/services/orders.service.ts`
- `features/checkin/services/checkin.service.ts`

Integrações externas e clientes base ficam em `integrations/`.

### `types`

Tipos de domínio ficam dentro da feature quando são especificos daquele contexto.

Exemplos:

- `features/events/types/event-status.ts`
- `features/staff/types/shift.ts`
- `features/financial/types/settlement-summary.ts`

Tipos compartilhados entre vários domínios sobem para `shared/types` ou `shared/contracts`.

## Regra De Dependência

A direção oficial de dependência e:

`app -> features -> shared -> integrations -> infra`

Regras práticas:

- `features` podem consumir `shared`, `integrations` e `infra`;
- `shared` nunca depende de `features`;
- `integrations` não conhece regra de produto;
- `infra` permanece técnico e transversal;
- `app` orquestra a experiência, mas não concentra regra de negócio.

## Estrutura Padrão De Cada Feature

```txt
features/<domain>/
  components/
  hooks/
  services/
  types/
  schemas/
  utils/
  pages/
  constants/
  index.ts
```

### Papel De Cada Pasta

- `components/`: UI e containers do domínio.
- `hooks/`: queries, mutations e hooks de composicao.
- `services/`: acesso a dados e casos de uso.
- `types/`: modelos, DTOs e enums.
- `schemas/`: válidação de formularios e payloads.
- `utils/`: transformacoes puras do domínio.
- `pages/`: rotas do domínio.
- `constants/`: labels, status e configurações estaticas.
- `index.ts`: superficie pública da feature.

## Mapa De Migracao Da Estrutura Atual

Hoje o projeto ainda esta mais próximo deste desenho:

- `src/pages`
- `src/components`
- `src/lib`

A migracao recomendada e:

1. manter a estrutura atual funcionando sem ruptura;
2. criar `src/app`, `src/features`, `src/shared`, `src/integrations` e `src/infra`;
3. mover novos módulos diretamente para `features`;
4. migrar telas existentes por prioridade de negócio:
   - `EventsPage` -> `features/events/pages`
   - `TicketsPage` -> `features/tickets/pages`
   - `CheckinPage` -> `features/checkin/pages`
   - `StaffPage` -> `features/staff/pages`
   - `FinancialPage` -> `features/financial/pages`
   - `GrowthPage` -> `features/growth/pages`
5. transformar `src/lib/store/auth.ts` em parte da camada `infra/auth` ou `app/providers` ao amadurecer a bootstrap de sessão.

## Expansao Futura

Essa estrutura permite abrir novos domínios sem reordenar o projeto:

```txt
features/
  crm/
  suppliers/
  pós/
  inventory/
  ai/
  billing/
```

O critério continua o mesmo: cada novo módulo entra como capacidade de negócio, com ownership claro, fronteira definida e contratos previsíveis.
