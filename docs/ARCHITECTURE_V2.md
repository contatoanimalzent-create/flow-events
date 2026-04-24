# ARCHITECTURE V2

## Objetivo Arquitetural

O Animalz Events precisa operar como um produto de missao crítica para empresas que executam multiplos eventos, com multiplas equipes, canais de venda e fluxos financeiros simultaneos. A arquitetura frontend não pode ser apenas organizada; ela precisa suportar escala operacional, velocidade de time e confiabilidade de negócio.

A direção oficial da V2 é:

- frontend orientado por domínio de negócio, e não por tipo técnico;
- server state centralizado em React Query;
- estado global enxuto com Zustand;
- Supabase isolado em camada de integração e service layer;
- rotas, providers e shell concentrados em uma camada `app`;
- capacidade de crescer para novos domínios sem reorganizacao estrutural.

## Arquitetura Ideal Frontend

### Principios

- Cada feature representa uma capacidade real do produto: eventos, ingressos, check-in, staff, financeiro e growth.
- Componentes de página orquestram experiência; regra de negócio não vive dentro da UI.
- O frontend consome casos de uso por hooks e services, não por chamadas diretas ao banco.
- O schema do Supabase não deve vazar para toda a aplicacao.
- Dados de backend pertencem ao cache do React Query; sessão e preferencia pertencem ao estado global.
- Fluxos criticos como checkout, emissão e check-in devem ser desenhados para idempotencia, observabilidade e recuperacao de falha.

### Camadas Oficiais

1. `app`
Bootstrap, providers, roteamento, shell autenticado, guards e composicao global.

2. `features`
Capacidades de negócio. Cada domínio contem sua própria UI, hooks, services, tipos e regras de composicao.

3. `shared`
Design system, utilitarios, contratos e componentes realmente reutilizaveis.

4. `integrations`
Conexao com Supabase, Stripe, analytics, notificacoes e observabilidade.

5. `infra`
Query client, env, auth helpers, feature flags, error handling e concerns transversais.

### Estratégia De Transicao

O projeto hoje ainda carrega uma estrutura mais centrada em `pages`, `components` e `lib`. A V2 não exige reescrita imediata; exige uma migracao orientada por fronteira:

- novas entregas entram no modelo por domínio;
- código existente migra por módulo quando houver alteração relevante;
- `src/pages/*` vira camada temporaria até cada domínio ganhar sua própria `pages/`;
- `src/lib/supabase.ts` e stores atuais permanecem como ponte até a camada `integrations/` estar consolidada.

## Organização Por Domínio

### Domínios Core

- `events`
Cria, edita, pública e governa eventos, agenda, local, capacidade, identidade e status operacional.

- `tickets`
Controla ticket types, lotes, estoque, precificação, vouchers, pedidos, emissão, transferência e reembolso.

- `checkin`
Opera leitura de QR, válidação de acesso, histórico de entradas, exceções, filas e auditoria de portaria.

- `staff`
Gerencia equipe operacional, cargos, permissões de campo, escalas, alocacoes e trilha de responsabilidade.

- `financial`
Consolida receita, taxas, custos, repasses, DRE operacional, conciliacao, chargeback e caixa por evento.

- `growth`
Conecta campanhas, canais, cupons, afiliacao, funis, automações, segmentação e inteligência comercial.

### Regra De Dependência

- `app` pode depender de `features`, `shared`, `integrations` e `infra`;
- `features` podem depender de `shared`, `integrations` e `infra`;
- uma feature não importa implementacao interna de outra feature;
- contratos compartilhados entre domínios sobem para `shared/contracts` ou `shared/types`;
- `shared` não conhece regra de negócio de domínio;
- `integrations` não conhece experiência de UI nem regra de produto de alto nivel.

## Padrão De Hooks Com React Query

React Query e a camada oficial para leitura, mutacao, cache, sincronização e invalidacao de server state.

### Tipos De Hook

- hooks de leitura: `useEventQuery`, `useTicketsQuery`, `useFinancialSummaryQuery`;
- hooks de mutacao: `useCreateEventMutation`, `usePublishEventMutation`, `useConfirmCheckinMutation`;
- hooks de composicao: `useEventDashboardData`, `useCheckoutFlow`, `useLiveCheckinBoard`.

### Regras Oficiais

- nenhum componente chama `supabase.from(...)` diretamente;
- todo hook define `queryKey`, `queryFn`, políticas de stale time e tratamento de erro;
- filtros, página, busca e tenant entram na query key;
- mutacoes invalidam apenas o conjunto mínimo de dados afetado;
- `select` e usado para adaptar payload para a UI quando isso simplifica consumo;
- prefetch deve ser usado em rotas e fluxos de alta recorrencia;
- realtime atualiza cache com invalidacao dirigida ou patch controlado, nunca com refetch global.

### Convencao De Query Keys

```ts
['session', organizationId]
['events', organizationId, filters]
['events', eventId]
['events', eventId, 'tickets']
['events', eventId, 'checkin', gateId]
['financial', organizationId, 'summary', period]
['growth', eventId, 'campaigns']
```

### Exemplo De Hook

```ts
export function useEventSummaryQuery(eventId: string | null) {
  return useQuery({
    queryKey: ['events', eventId, 'summary'],
    queryFn: () => eventsService.getSummary(eventId as string),
    enabled: Boolean(eventId),
    staleTime: 60_000,
  })
}
```

### Padrão Para Fluxos Criticos

- checkout: mutacoes idempotentes, polling controlado ou reconciliacao por webhook;
- emissão: invalidacao atomica de pedidos, tickets e inventory;
- check-in: estado otimista apenas onde houver garantia de reconciliacao;
- dashboards operacionais: refresh curto ou realtime por canal especifico.

## Padrão De Services

Services são a fronteira oficial entre regra de interface e acesso a dados.

### Responsabilidades

- encapsular chamadas ao Supabase, RPCs e Edge Functions;
- montar filtros, joins, ordenacao e página;
- normalizar erros técnicos em erros de negócio;
- mapear linhas do banco para modelos de uso do frontend;
- concentrar lógica de integração com Stripe, notificacoes e analytics quando o caso de uso exigir.

### Contrato Recomendado

Cada domínio deve expor services orientados a caso de uso:

- `eventsService.list`
- `eventsService.getById`
- `eventsService.createDraft`
- `eventsService.publish`
- `ticketsService.reserveInventory`
- `ticketsService.issueOrder`
- `checkinService.validateAccess`
- `financialService.getSettlementSummary`

### Regras

- service retorna dado tipado e consistente para a camada de hook;
- service não conhece componente;
- service não deve misturar side effects de UI;
- operações sensiveis vao para Edge Functions ou RPC, não para mutacao direta no cliente;
- service pode compor multiplas fontes, mas expoe uma interface única para a feature.

## Padrão De Estado Global

Zustand continua na stack, mas com papel restrito. O objetivo é impedir que estado global vire cache paralelo ou deposito de dados de backend.

### O Que Vai Para Estado Global

- sessão autenticada;
- profile e organization ativa;
- permissão efetiva do usuário;
- evento em foco quando fizer sentido de navegação;
- estado de shell: sidebar, modal global, filtros persistidos de UX;
- preferências de interface: tema, idioma, densidade, atalhos.

### O Que Não Vai Para Estado Global

- listas de eventos;
- inventory de tickets;
- métricas financeiras;
- resultados de campanhas;
- histórico de check-in;
- qualquer dado que precise invalidacao de backend.

### Stores Oficiais

- `authStore`
Autenticacao, profile, organization, permissão efetiva e bootstrap de sessão.

- `uiStore`
Shell, overlays, preferências locais e estados de experiência.

- `contextStore`
Tenant ativo, evento em foco e escopo operacional atual.

### Regra De Ouro

Se o dado vem do backend e pode ficar stale, ele vai para React Query. Se o dado define experiência local ou sessão, ele pode ir para Zustand.

## Estrutura Com Supabase

Supabase e o backend operacional do Animalz Events e precisa ser tratado como plataforma, não apenas como banco hospedado.

### Camadas Do Supabase

1. `Auth`
Login, sessão, recovery, convite, troca obrigatoria de senha, roles basicas e identidade do usuário.

2. `Postgres + RLS`
Fonte de verdade de organizações, eventos, tickets, pedidos, check-ins, staff, financeiro, campanhas e auditoria.

3. `Edge Functions`
Checkout, Stripe, webhooks, emissão, automações, integrações externas e mutacoes sensiveis.

4. `Realtime`
Canal dedicado para operação ao vivo, quando houver beneficio concreto em check-in, status de fila ou atualizacao instantanea.

### Diretrizes Estruturais

- multi-tenant por organização desde a raiz do schema;
- RLS como barreira primaria de segurança;
- policies baseadas em organização, papel e escopo operacional;
- trilha auditavel para mudancas financeiras e operacionais;
- funcoes atomicas para reserva de estoque, confirmação de pagamento, emissão e reconciliacao;
- tipos do banco gerados e versionados para consumo no frontend.

### Estrutura Recomendada

```txt
supabase/
  migrations/
  functions/
    checkout-session/
    payment-webhook/
    issue-tickets/
    validate-checkin/
    sync-analytics/
  seeds/
```

### Fronteira No Frontend

- `integrations/supabase/client.ts`
- `integrations/supabase/db.types.ts`
- `integrations/supabase/auth.ts`
- `integrations/supabase/repositories/*`

As features usam services. Os services usam repositories ou clients de integração. O componente nunca toca no client do Supabase.

## Convencoes Técnicas

### Roteamento

- adotar TanStack Router como padrão para a V2;
- separar rotas públicas, autenticadas e operacionais;
- usar route loaders para prefetch de dados relevantes;
- tratar `AppRouter` atual como ponte de transicao, não como arquitetura final.

### Tipagem E Válidação

- tipos de domínio ficam perto da feature;
- contratos compartilhados sobem para `shared/types`;
- payloads criticos devem usar schema validation;
- respostas de service devem ser normalizadas antes de chegar na UI.

### UI E Composicao

- páginas finas e containers pequenos;
- componentes compartilhados em `shared/ui`;
- estados de loading, empty e erro padronizados por feature;
- acessibilidade obrigatoria em login, checkout e check-in;
- design system com tokens e variaveis globais, não estilos arbitrarios por tela.

### Observabilidade

- tracking de eventos de produto por domínio;
- logs para operações financeiras e de acesso;
- monitoramento de erro por ambiente;
- correlation id para fluxos criticos de compra e check-in.

## Fluxos Criticos

### 1. Auth E Resolucao De Tenant

- usuário autentica;
- perfil resolve organização e papel;
- shell privado sobe apenas após validar sessão e contexto;
- permissões de rota e feature são calculadas antes de liberar a experiência.

### 2. Criacao E Publicação De Evento

- evento nasce em `draft`;
- configuração de agenda, capacidade e venda acontece por etapas;
- publicação depende de válidação de consistencia;
- mutacao invalida dashboards, páginas internas e páginas públicas relevantes.

### 3. Checkout E Emissão

- inventory e reservado com segurança;
- pedido nasce em estado intermediario;
- webhook ou confirmação transacional finaliza pagamento;
- emissão atualiza pedidos, tickets e indicadores sem divergencia.

### 4. Check-in Ao Vivo

- leitura precisa responder em sub-segundo no caso ideal;
- o sistema diferencia ticket valido, duplicado, cancelado e fora da regra;
- falhas de conectividade precisam de estratégia de degradacao controlada;
- auditoria registra dispositivo, operador, gate e horario.

### 5. Financeiro Consolidado

- receita, taxa, custo e repasse compartilham o mesmo modelo operacional;
- os dados fecham por evento e por organização;
- mutacoes com impacto de caixa exigem rastreabilidade e idempotencia.

### 6. Growth E Inteligência

- eventos de compra, abandono e presença alimentam analytics;
- campanhas conversam com receita real, não so com clique;
- futuras automações e IA consomem a mesma base de verdade do produto.

## Resultado Esperado

Com essa arquitetura, o Animalz Events deixa de ser um frontend de telas isoladas e passa a operar como uma plataforma SaaS de alto controle. O time ganha velocidade para abrir novos domínios, o produto ganha previsibilidade para escalar e o negócio ganha uma base técnica pronta para venda, operação, gestão, financeiro, growth e inteligência dentro do mesmo sistema.
