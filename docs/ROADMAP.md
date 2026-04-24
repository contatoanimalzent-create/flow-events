# ROADMAP

## Visão De Produto

O roadmap do Animalz Events não é a soma de features isoladas. Ele representa a construção de uma plataforma operacional completa para empresas que tratam eventos como negócio recorrente, com exigência real de receita, controle, margem e inteligência.

Cada fase precisa entregar valor utilizável e, ao mesmo tempo, fortalecer o efeito plataforma: um módulo alimenta o próximo e todos compartilham a mesma base operacional.

## Fase 1: Fundação

### Objetivo

Criar a fundação técnica e de produto que sustenta um SaaS multi-tenant, seguro, auditável e pronto para crescimento sem retrabalho estrutural.

### Capacidades

- autenticacao e sessão confiaveis;
- RBAC por papel e escopo;
- modelo base de organização, usuário e evento;
- shell do produto e navegação principal;
- estrutura frontend por domínio;
- base de observabilidade, auditoria e ambientes.

### Entregaveis

- auth com login, sessão persistida, troca obrigatória de senha e recovery;
- modelo multi-tenant por organização;
- permissões para `admin`, `manager`, `operator`, `finance`, `staff`;
- arquitetura V2 implementada como direção oficial;
- base Supabase com migrations, policies, indexes e seed;
- query client, providers globais, guards e design system inicial;
- monitoramento de erro e eventos operacionais básicos.

### Dependências

- definicao do posicionamento oficial do produto;
- convencoes de arquitetura e estrutura de pastas;
- modelo inicial de perfis e organizações;
- setup de Supabase, Vercel e ambientes.

### Métricas De Sucesso

- zero vazamento entre tenants;
- 100% das rotas privadas protegidas;
- tempo de bootstrap autenticado menor que 3 segundos;
- deploy continuo funcional com preview por ambiente;
- base pronta para evolução dos domínios core sem reorganização.

### Riscos

- superengenharia na fundação e atraso na captura de valor;
- permissão simplificada demais e insegura;
- modelo de dados inflexivel para eventos de formatos diferentes;
- pouca observabilidade logo no início.

## Fase 2: Core

### Objetivo

Entregar a maquina comercial do produto: criacao de eventos, estruturacao de ingressos, checkout confiável e emissão com QR.

### Capacidades

- CRUD completo de eventos;
- configuração de ticket types e lotes;
- venda online com controle de estoque;
- checkout com pagamento e confirmação;
- emissão de tickets com QR único;
- experiência pública do evento orientada a conversão.

### Entregaveis

- backoffice de eventos com status, agenda, local e branding;
- gestão de ingressos, preços, lotes, cotas e cupons;
- página pública do evento com CTA e conteúdo comercial;
- reserva temporária de inventory no checkout;
- integração de pagamento e reconciliação de status;
- pedido, comprovante e área do comprador;
- emissão segura de QR e serial de ingresso;
- eventos de analytics no funil de compra.

### Dependências

- fundação de auth, tenant e permissão;
- arquitetura frontend orientada por domínio;
- Edge Functions para checkout e confirmação;
- estrutura de dados consistente para pedidos e tickets.

### Métricas De Sucesso

- conversão de checkout acima de 60% em trafego qualificado;
- menos de 1% de falha na emissão de ingresso;
- tempo de carregamento da página pública abaixo de 2 segundos;
- divergência de inventory próxima de zero;
- instrumentacao completa das etapas do funil.

### Riscos

- overselling por reserva mal desenhada;
- pedido pago sem emissão consistente;
- QR replicável ou pouco auditável;
- experiência pública lenta e com baixa conversão.

## Fase 3: Operação

### Objetivo

Transformar o Animalz Events em software de execução ao vivo, com check-in, staff e controle de campo em tempo real.

### Capacidades

- check-in rápido e confiável;
- operação por gate, área e dispositivo;
- gestão de staff e escalas;
- credenciamento e tratamento de exceção;
- auditoria operacional;
- tolerância a instabilidade de rede.

### Entregaveis

- módulo de check-in com leitura de QR;
- painel ao vivo por evento;
- válidação por tipo de acesso, status e regra operacional;
- registro de acesso duplicado, inválido, cancelado e bloqueado;
- gestão de equipe, cargos e alocacoes;
- logs por operador, gate e horário;
- estratégia de sincronização para ambientes com conectividade limitada.

### Dependências

- tickets e emissão totalmente estáveis;
- modelo de permissão mais refinado;
- canais de realtime ou refresh controlado;
- trilha auditável de mutacoes.

### Métricas De Sucesso

- válidação media de acesso abaixo de 1 segundo;
- 100% das entradas auditadas;
- operação simultanea em vários pontos de acesso;
- queda drástica de retrabalho na portaria;
- taxa mínima de inconsistências em válidação.

### Riscos

- dependência excessiva de internet no local;
- UI pesada em dispositivos modestos;
- regra de acesso pouco flexivel para diferentes formatos de evento;
- pouca visibilidade sobre exceções operacionais.

## Fase 4: Gestão

### Objetivo

Tornar o produto o centro de comando administrativo e financeiro do evento, conectando receita, custo, repasse, PDV e estoque.

### Capacidades

- resumo financeiro por evento e organização;
- conciliação e fechamento;
- repasses, taxas e chargebacks;
- PDV integrado;
- estoque operacional;
- fornecedores e custos;
- visão de margem e rentabilidade.

### Entregaveis

- dashboard financeiro com receita, taxa, custo e margem;
- DRE operacional por evento;
- conciliação entre venda, pagamento e repasse;
- módulo de PDV conectado ao ecossistema do evento;
- controle de estoque e consumo operacional;
- cadastro de fornecedores, contratos e centros de custo;
- relatórios executivos por periodo, marca, cidade e unidade.

### Dependências

- dados comerciais confiaveis;
- modelo financeiro consistente;
- auditoria madura de transações;
- estrutura de permissão adequada para backoffice administrativo.

### Métricas De Sucesso

- conciliação acima de 99%;
- visibilidade de margem em D+1;
- redução do tempo de fechamento operacional;
- adesao do financeiro e da gestão como usuários recorrentes;
- menor divergência entre operação e caixa.

### Riscos

- simplificacao excessiva da modelagem financeira;
- integração fraca entre PDV, estoque e financeiro;
- dependência de processos manuais para fechar números;
- perda de confiança caso os dados atrasem ou divirjam.

## Fase 5: Inteligência

### Objetivo

Converter o Animalz Events em camada de decisão e automação, usando dados e IA para aumentar receita, reduzir risco e melhorar a execução.

### Capacidades

- analytics por evento, organização e portfolio;
- previsão de demanda e ritmo de venda;
- recomendação de preço, lote e capacidade;
- automações baseadas em gatilho;
- alertas operacionais e financeiros;
- assistentes de IA para consulta e suporte;
- growth orientado a comportamento e receita real.

### Entregaveis

- dashboards de cohort, funil, presença e recorrência;
- alertas de anomalia em venda, check-in e caixa;
- automações para follow-up, campanha e remediacao operacional;
- consulta em linguagem natural sobre o negócio do evento;
- recomendações de ação comercial e operacional;
- biblioteca padronizada de métricas de negócio;
- camada analítica que cruza aquisição, receita, presença e margem.

### Dependências

- instrumentacao de eventos desde as fases anteriores;
- histórico confiável de dados;
- taxonomia comum entre módulos;
- governança de acesso e uso de dados.

### Métricas De Sucesso

- aumento de receita assistida por recomendação;
- redução do tempo de análise manual;
- identificacao antecipada de riscos;
- adoção real de insights por operação e gestão;
- crescimento da recompra e da eficiencia de campanha.

### Riscos

- IA sem base confiável gerar sugestoes ruins;
- automação demais criar ruído em vez de ganho;
- métricas inconsistentes contaminarem decisões;
- falta de governança sobre alertas, modelos e permissões.

## Sequenciamento Estrategico

O roadmap deve obedecer a está lógica:

- primeiro, construir confiabilidade estrutural;
- depois, capturar a transação central;
- em seguida, dominar a operação ao vivo;
- depois, consolidar a unidade econômica do evento;
- por fim, transformar dado em vantagem composta.

Se uma fase não alimentar a seguinte, ela foi desenhada errado. O Animalz Events precisa crescer como sistema operacional integrado, não como marketplace de features.
