# ARCHITECTURE V2

## Objetivo Arquitetural

O Animalz Events precisa operar como um produto de missao critica para empresas que executam multiplos eventos, com multiplas equipes, canais de venda e fluxos financeiros simultaneos. A arquitetura frontend nao pode ser apenas organizada; ela precisa suportar escala operacional, velocidade de time e confiabilidade de negocio.

A direcao oficial da V2 e:

- frontend orientado por dominio de negocio, e nao por tipo tecnico;
- server state centralizado em React Query;
- estado global enxuto com Zustand;
- Supabase isolado em camada de integracao e service layer;
- rotas, providers e shell concentrados em uma camada `app`;
- capacidade de crescer para novos dominios sem reorganizacao estrutural.

## Arquitetura Ideal Frontend

### Principios

- Cada feature representa uma capacidade real do produto: eventos, ingressos, check-in, staff, financeiro e growth.
- Componentes de pagina orquestram experiencia; regra de negocio nao vive dentro da UI.
- O frontend consome casos de uso por hooks e services, nao por chamadas diretas ao banco.
- O schema do Supabase nao deve vazar para toda a aplicacao.
- Dados de backend pertencem ao cache do React Query; sessao e preferencia pertencem ao estado global.
- Fluxos criticos como checkout, emissao e check-in devem ser desenhados para idempotencia, observabilidade e recuperacao de falha.

### Camadas Oficiais

1. `app`
Bootstrap, providers, roteamento, shell autenticado, guards e composicao global.

2. `features`
Capacidades de negocio. Cada dominio contem sua propria UI, hooks, services, tipos e regras de composicao.

3. `shared`
Design system, utilitarios, contratos e componentes realmente reutilizaveis.

4. `integrations`
Conexao com Supabase, Stripe, analytics, notificacoes e observabilidade.

5. `infra`
Query client, env, auth helpers, feature flags, error handling e concerns transversais.

### Estrategia De Transicao

O projeto hoje ainda carrega uma estrutura mais centrada em `pages`, `components` e `lib`. A V2 nao exige reescrita imediata; exige uma migracao orientada por fronteira:

- novas entregas entram no modelo por dominio;
- codigo existente migra por modulo quando houver alteracao relevante;
- `src/pages/*` vira camada temporaria ate cada dominio ganhar sua propria `pages/`;
- `src/lib/supabase.ts` e stores atuais permanecem como ponte ate a camada `integrations/` estar consolidada.

## Organizacao Por Dominio

### Dominios Core

- `events`
Cria, edita, publica e governa eventos, agenda, local, capacidade, identidade e status operacional.

- `tickets`
Controla ticket types, lotes, estoque, precificacao, vouchers, pedidos, emissao, transferencia e reembolso.

- `checkin`
Opera leitura de QR, validacao de acesso, historico de entradas, excecoes, filas e auditoria de portaria.

- `staff`
Gerencia equipe operacional, cargos, permissoes de campo, escalas, alocacoes e trilha de responsabilidade.

- `financial`
Consolida receita, taxas, custos, repasses, DRE operacional, conciliacao, chargeback e caixa por evento.

- `growth`
Conecta campanhas, canais, cupons, afiliacao, funis, automacoes, segmentacao e inteligencia comercial.

### Regra De Dependencia

- `app` pode depender de `features`, `shared`, `integrations` e `infra`;
- `features` podem depender de `shared`, `integrations` e `infra`;
- uma feature nao importa implementacao interna de outra feature;
- contratos compartilhados entre dominios sobem para `shared/contracts` ou `shared/types`;
- `shared` nao conhece regra de negocio de dominio;
- `integrations` nao conhece experiencia de UI nem regra de produto de alto nivel.

## Padrao De Hooks Com React Query

React Query e a camada oficial para leitura, mutacao, cache, sincronizacao e invalidacao de server state.

### Tipos De Hook

- hooks de leitura: `useEventQuery`, `useTicketsQuery`, `useFinancialSummaryQuery`;
- hooks de mutacao: `useCreateEventMutation`, `usePublishEventMutation`, `useConfirmCheckinMutation`;
- hooks de composicao: `useEventDashboardData`, `useCheckoutFlow`, `useLiveCheckinBoard`.

### Regras Oficiais

- nenhum componente chama `supabase.from(...)` diretamente;
- todo hook define `queryKey`, `queryFn`, politicas de stale time e tratamento de erro;
- filtros, pagina, busca e tenant entram na query key;
- mutacoes invalidam apenas o conjunto minimo de dados afetado;
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

### Padrao Para Fluxos Criticos

- checkout: mutacoes idempotentes, polling controlado ou reconciliacao por webhook;
- emissao: invalidacao atomica de pedidos, tickets e inventory;
- check-in: estado otimista apenas onde houver garantia de reconciliacao;
- dashboards operacionais: refresh curto ou realtime por canal especifico.

## Padrao De Services

Services sao a fronteira oficial entre regra de interface e acesso a dados.

### Responsabilidades

- encapsular chamadas ao Supabase, RPCs e Edge Functions;
- montar filtros, joins, ordenacao e pagina;
- normalizar erros tecnicos em erros de negocio;
- mapear linhas do banco para modelos de uso do frontend;
- concentrar logica de integracao com Stripe, notificacoes e analytics quando o caso de uso exigir.

### Contrato Recomendado

Cada dominio deve expor services orientados a caso de uso:

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
- service nao conhece componente;
- service nao deve misturar side effects de UI;
- operacoes sensiveis vao para Edge Functions ou RPC, nao para mutacao direta no cliente;
- service pode compor multiplas fontes, mas expoe uma interface unica para a feature.

## Padrao De Estado Global

Zustand continua na stack, mas com papel restrito. O objetivo e impedir que estado global vire cache paralelo ou deposito de dados de backend.

### O Que Vai Para Estado Global

- sessao autenticada;
- profile e organization ativa;
- permissao efetiva do usuario;
- evento em foco quando fizer sentido de navegacao;
- estado de shell: sidebar, modal global, filtros persistidos de UX;
- preferencias de interface: tema, idioma, densidade, atalhos.

### O Que Nao Vai Para Estado Global

- listas de eventos;
- inventory de tickets;
- metricas financeiras;
- resultados de campanhas;
- historico de check-in;
- qualquer dado que precise invalidacao de backend.

### Stores Oficiais

- `authStore`
Autenticacao, profile, organization, permissao efetiva e bootstrap de sessao.

- `uiStore`
Shell, overlays, preferencias locais e estados de experiencia.

- `contextStore`
Tenant ativo, evento em foco e escopo operacional atual.

### Regra De Ouro

Se o dado vem do backend e pode ficar stale, ele vai para React Query. Se o dado define experiencia local ou sessao, ele pode ir para Zustand.

## Estrutura Com Supabase

Supabase e o backend operacional do Animalz Events e precisa ser tratado como plataforma, nao apenas como banco hospedado.

### Camadas Do Supabase

1. `Auth`
Login, sessao, recovery, convite, troca obrigatoria de senha, roles basicas e identidade do usuario.

2. `Postgres + RLS`
Fonte de verdade de organizacoes, eventos, tickets, pedidos, check-ins, staff, financeiro, campanhas e auditoria.

3. `Edge Functions`
Checkout, Stripe, webhooks, emissao, automacoes, integracoes externas e mutacoes sensiveis.

4. `Realtime`
Canal dedicado para operacao ao vivo, quando houver beneficio concreto em check-in, status de fila ou atualizacao instantanea.

### Diretrizes Estruturais

- multi-tenant por organizacao desde a raiz do schema;
- RLS como barreira primaria de seguranca;
- policies baseadas em organizacao, papel e escopo operacional;
- trilha auditavel para mudancas financeiras e operacionais;
- funcoes atomicas para reserva de estoque, confirmacao de pagamento, emissao e reconciliacao;
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

As features usam services. Os services usam repositories ou clients de integracao. O componente nunca toca no client do Supabase.

## Convencoes Tecnicas

### Roteamento

- adotar TanStack Router como padrao para a V2;
- separar rotas publicas, autenticadas e operacionais;
- usar route loaders para prefetch de dados relevantes;
- tratar `AppRouter` atual como ponte de transicao, nao como arquitetura final.

### Tipagem E Validacao

- tipos de dominio ficam perto da feature;
- contratos compartilhados sobem para `shared/types`;
- payloads criticos devem usar schema validation;
- respostas de service devem ser normalizadas antes de chegar na UI.

### UI E Composicao

- paginas finas e containers pequenos;
- componentes compartilhados em `shared/ui`;
- estados de loading, empty e erro padronizados por feature;
- acessibilidade obrigatoria em login, checkout e check-in;
- design system com tokens e variaveis globais, nao estilos arbitrarios por tela.

### Observabilidade

- tracking de eventos de produto por dominio;
- logs para operacoes financeiras e de acesso;
- monitoramento de erro por ambiente;
- correlation id para fluxos criticos de compra e check-in.

## Fluxos Criticos

### 1. Auth E Resolucao De Tenant

- usuario autentica;
- perfil resolve organizacao e papel;
- shell privado sobe apenas apos validar sessao e contexto;
- permissoes de rota e feature sao calculadas antes de liberar a experiencia.

### 2. Criacao E Publicacao De Evento

- evento nasce em `draft`;
- configuracao de agenda, capacidade e venda acontece por etapas;
- publicacao depende de validacao de consistencia;
- mutacao invalida dashboards, paginas internas e paginas publicas relevantes.

### 3. Checkout E Emissao

- inventory e reservado com seguranca;
- pedido nasce em estado intermediario;
- webhook ou confirmacao transacional finaliza pagamento;
- emissao atualiza pedidos, tickets e indicadores sem divergencia.

### 4. Check-in Ao Vivo

- leitura precisa responder em sub-segundo no caso ideal;
- o sistema diferencia ticket valido, duplicado, cancelado e fora da regra;
- falhas de conectividade precisam de estrategia de degradacao controlada;
- auditoria registra dispositivo, operador, gate e horario.

### 5. Financeiro Consolidado

- receita, taxa, custo e repasse compartilham o mesmo modelo operacional;
- os dados fecham por evento e por organizacao;
- mutacoes com impacto de caixa exigem rastreabilidade e idempotencia.

### 6. Growth E Inteligencia

- eventos de compra, abandono e presenca alimentam analytics;
- campanhas conversam com receita real, nao so com clique;
- futuras automacoes e IA consomem a mesma base de verdade do produto.

## Resultado Esperado

Com essa arquitetura, o Animalz Events deixa de ser um frontend de telas isoladas e passa a operar como uma plataforma SaaS de alto controle. O time ganha velocidade para abrir novos dominios, o produto ganha previsibilidade para escalar e o negocio ganha uma base tecnica pronta para venda, operacao, gestao, financeiro, growth e inteligencia dentro do mesmo sistema.
