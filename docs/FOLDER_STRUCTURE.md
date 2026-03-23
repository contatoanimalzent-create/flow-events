# FOLDER STRUCTURE

## Principio Estrutural

A estrutura oficial do projeto deve seguir o negocio, nao a tecnologia. O objetivo e permitir que cada dominio evolua com autonomia, sem espalhar regra critica em `pages`, `components` e `lib` de forma difusa.

Essa organizacao foi desenhada para:

- escalar o produto sem reescrever base;
- permitir ownership claro por dominio;
- reduzir acoplamento entre times e modulos;
- manter UI, data layer e regras de negocio proximas;
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

## Separacao Por Dominio

### `/features/events`

Responsavel por todo o ciclo de vida do evento:

- draft, publicacao e despublicacao;
- agenda, venue, capacidade e identidade;
- status operacional;
- configuracoes base do evento.

### `/features/tickets`

Responsavel pela operacao comercial:

- ticket types e lotes;
- estoque e regras de venda;
- vouchers, desconto e upsell;
- pedido, emissao, transferencia e cancelamento;
- checkout e conciliacao do funil de compra.

### `/features/checkin`

Responsavel pela operacao de acesso:

- leitura de QR;
- validacao de ingresso;
- gate, fila e status de entrada;
- auditoria de operador, dispositivo e horario;
- tratamento de excecao operacional.

### `/features/staff`

Responsavel pela estrutura de equipe:

- perfis operacionais;
- escalas e alocacao por area;
- credenciais e permissoes de campo;
- responsabilidade por tarefa ou posto.

### `/features/financial`

Responsavel pela unidade economica do evento:

- resumo financeiro por evento e organizacao;
- taxas, repasses, custos e margem;
- conciliacao;
- chargeback, reembolso e fechamento;
- caixa, PDV e visao gerencial.

### `/features/growth`

Responsavel por aquisicao, retencao e inteligencia comercial:

- campanhas e canais;
- cupons e afiliacao;
- segmentos e automacoes;
- funis, cohorts e atribuicao;
- recomendacoes e sinais de receita.

## Onde Ficam Components, Hooks, Services E Types

### `components`

Componentes que conhecem o dominio vivem dentro da propria feature.

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

Hooks compartilhados, sem regra de negocio, ficam em `shared/hooks`.

### `services`

Services ficam dentro do dominio quando representam caso de uso do dominio.

Exemplos:

- `features/events/services/events.service.ts`
- `features/tickets/services/orders.service.ts`
- `features/checkin/services/checkin.service.ts`

Integracoes externas e clientes base ficam em `integrations/`.

### `types`

Tipos de dominio ficam dentro da feature quando sao especificos daquele contexto.

Exemplos:

- `features/events/types/event-status.ts`
- `features/staff/types/shift.ts`
- `features/financial/types/settlement-summary.ts`

Tipos compartilhados entre varios dominios sobem para `shared/types` ou `shared/contracts`.

## Regra De Dependencia

A direcao oficial de dependencia e:

`app -> features -> shared -> integrations -> infra`

Regras praticas:

- `features` podem consumir `shared`, `integrations` e `infra`;
- `shared` nunca depende de `features`;
- `integrations` nao conhece regra de produto;
- `infra` permanece tecnico e transversal;
- `app` orquestra a experiencia, mas nao concentra regra de negocio.

## Estrutura Padrao De Cada Feature

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

- `components/`: UI e containers do dominio.
- `hooks/`: queries, mutations e hooks de composicao.
- `services/`: acesso a dados e casos de uso.
- `types/`: modelos, DTOs e enums.
- `schemas/`: validacao de formularios e payloads.
- `utils/`: transformacoes puras do dominio.
- `pages/`: rotas do dominio.
- `constants/`: labels, status e configuracoes estaticas.
- `index.ts`: superficie publica da feature.

## Mapa De Migracao Da Estrutura Atual

Hoje o projeto ainda esta mais proximo deste desenho:

- `src/pages`
- `src/components`
- `src/lib`

A migracao recomendada e:

1. manter a estrutura atual funcionando sem ruptura;
2. criar `src/app`, `src/features`, `src/shared`, `src/integrations` e `src/infra`;
3. mover novos modulos diretamente para `features`;
4. migrar telas existentes por prioridade de negocio:
   - `EventsPage` -> `features/events/pages`
   - `TicketsPage` -> `features/tickets/pages`
   - `CheckinPage` -> `features/checkin/pages`
   - `StaffPage` -> `features/staff/pages`
   - `FinancialPage` -> `features/financial/pages`
   - `GrowthPage` -> `features/growth/pages`
5. transformar `src/lib/store/auth.ts` em parte da camada `infra/auth` ou `app/providers` ao amadurecer a bootstrap de sessao.

## Expansao Futura

Essa estrutura permite abrir novos dominios sem reordenar o projeto:

```txt
features/
  crm/
  suppliers/
  pos/
  inventory/
  ai/
  billing/
```

O criterio continua o mesmo: cada novo modulo entra como capacidade de negocio, com ownership claro, fronteira definida e contratos previsiveis.
