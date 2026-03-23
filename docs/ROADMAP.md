# ROADMAP

## Visao De Produto

O roadmap do Animalz Events nao e a soma de features isoladas. Ele representa a construcao de uma plataforma operacional completa para empresas que tratam eventos como negocio recorrente, com exigencia real de receita, controle, margem e inteligencia.

Cada fase precisa entregar valor utilizavel e, ao mesmo tempo, fortalecer o efeito plataforma: um modulo alimenta o proximo e todos compartilham a mesma base operacional.

## Fase 1: Fundacao

### Objetivo

Criar a fundacao tecnica e de produto que sustenta um SaaS multi-tenant, seguro, auditavel e pronto para crescimento sem retrabalho estrutural.

### Capacidades

- autenticacao e sessao confiaveis;
- RBAC por papel e escopo;
- modelo base de organizacao, usuario e evento;
- shell do produto e navegacao principal;
- estrutura frontend por dominio;
- base de observabilidade, auditoria e ambientes.

### Entregaveis

- auth com login, sessao persistida, troca obrigatoria de senha e recovery;
- modelo multi-tenant por organizacao;
- permissoes para `admin`, `manager`, `operator`, `finance`, `staff`;
- arquitetura V2 implementada como direcao oficial;
- base Supabase com migrations, policies, indexes e seed;
- query client, providers globais, guards e design system inicial;
- monitoramento de erro e eventos operacionais basicos.

### Dependencias

- definicao do posicionamento oficial do produto;
- convencoes de arquitetura e estrutura de pastas;
- modelo inicial de perfis e organizacoes;
- setup de Supabase, Vercel e ambientes.

### Metricas De Sucesso

- zero vazamento entre tenants;
- 100% das rotas privadas protegidas;
- tempo de bootstrap autenticado menor que 3 segundos;
- deploy continuo funcional com preview por ambiente;
- base pronta para evolucao dos dominios core sem reorganizacao.

### Riscos

- superengenharia na fundacao e atraso na captura de valor;
- permissao simplificada demais e insegura;
- modelo de dados inflexivel para eventos de formatos diferentes;
- pouca observabilidade logo no inicio.

## Fase 2: Core

### Objetivo

Entregar a maquina comercial do produto: criacao de eventos, estruturacao de ingressos, checkout confiavel e emissao com QR.

### Capacidades

- CRUD completo de eventos;
- configuracao de ticket types e lotes;
- venda online com controle de estoque;
- checkout com pagamento e confirmacao;
- emissao de tickets com QR unico;
- experiencia publica do evento orientada a conversao.

### Entregaveis

- backoffice de eventos com status, agenda, local e branding;
- gestao de ingressos, precos, lotes, cotas e cupons;
- pagina publica do evento com CTA e conteudo comercial;
- reserva temporaria de inventory no checkout;
- integracao de pagamento e reconciliacao de status;
- pedido, comprovante e area do comprador;
- emissao segura de QR e serial de ingresso;
- eventos de analytics no funil de compra.

### Dependencias

- fundacao de auth, tenant e permissao;
- arquitetura frontend orientada por dominio;
- Edge Functions para checkout e confirmacao;
- estrutura de dados consistente para pedidos e tickets.

### Metricas De Sucesso

- conversao de checkout acima de 60% em trafego qualificado;
- menos de 1% de falha na emissao de ingresso;
- tempo de carregamento da pagina publica abaixo de 2 segundos;
- divergencia de inventory proxima de zero;
- instrumentacao completa das etapas do funil.

### Riscos

- overselling por reserva mal desenhada;
- pedido pago sem emissao consistente;
- QR replicavel ou pouco auditavel;
- experiencia publica lenta e com baixa conversao.

## Fase 3: Operacao

### Objetivo

Transformar o Animalz Events em software de execucao ao vivo, com check-in, staff e controle de campo em tempo real.

### Capacidades

- check-in rapido e confiavel;
- operacao por gate, area e dispositivo;
- gestao de staff e escalas;
- credenciamento e tratamento de excecao;
- auditoria operacional;
- tolerancia a instabilidade de rede.

### Entregaveis

- modulo de check-in com leitura de QR;
- painel ao vivo por evento;
- validacao por tipo de acesso, status e regra operacional;
- registro de acesso duplicado, invalido, cancelado e bloqueado;
- gestao de equipe, cargos e alocacoes;
- logs por operador, gate e horario;
- estrategia de sincronizacao para ambientes com conectividade limitada.

### Dependencias

- tickets e emissao totalmente estaveis;
- modelo de permissao mais refinado;
- canais de realtime ou refresh controlado;
- trilha auditavel de mutacoes.

### Metricas De Sucesso

- validacao media de acesso abaixo de 1 segundo;
- 100% das entradas auditadas;
- operacao simultanea em varios pontos de acesso;
- queda drastica de retrabalho na portaria;
- taxa minima de inconsistencias em validacao.

### Riscos

- dependencia excessiva de internet no local;
- UI pesada em dispositivos modestos;
- regra de acesso pouco flexivel para diferentes formatos de evento;
- pouca visibilidade sobre excecoes operacionais.

## Fase 4: Gestao

### Objetivo

Tornar o produto o centro de comando administrativo e financeiro do evento, conectando receita, custo, repasse, PDV e estoque.

### Capacidades

- resumo financeiro por evento e organizacao;
- conciliacao e fechamento;
- repasses, taxas e chargebacks;
- PDV integrado;
- estoque operacional;
- fornecedores e custos;
- visao de margem e rentabilidade.

### Entregaveis

- dashboard financeiro com receita, taxa, custo e margem;
- DRE operacional por evento;
- conciliacao entre venda, pagamento e repasse;
- modulo de PDV conectado ao ecossistema do evento;
- controle de estoque e consumo operacional;
- cadastro de fornecedores, contratos e centros de custo;
- relatorios executivos por periodo, marca, cidade e unidade.

### Dependencias

- dados comerciais confiaveis;
- modelo financeiro consistente;
- auditoria madura de transacoes;
- estrutura de permissao adequada para backoffice administrativo.

### Metricas De Sucesso

- conciliacao acima de 99%;
- visibilidade de margem em D+1;
- reducao do tempo de fechamento operacional;
- adesao do financeiro e da gestao como usuarios recorrentes;
- menor divergencia entre operacao e caixa.

### Riscos

- simplificacao excessiva da modelagem financeira;
- integracao fraca entre PDV, estoque e financeiro;
- dependencia de processos manuais para fechar numeros;
- perda de confianca caso os dados atrasem ou divirjam.

## Fase 5: Inteligencia

### Objetivo

Converter o Animalz Events em camada de decisao e automacao, usando dados e IA para aumentar receita, reduzir risco e melhorar a execucao.

### Capacidades

- analytics por evento, organizacao e portfolio;
- previsao de demanda e ritmo de venda;
- recomendacao de preco, lote e capacidade;
- automacoes baseadas em gatilho;
- alertas operacionais e financeiros;
- assistentes de IA para consulta e suporte;
- growth orientado a comportamento e receita real.

### Entregaveis

- dashboards de cohort, funil, presenca e recorrencia;
- alertas de anomalia em venda, check-in e caixa;
- automacoes para follow-up, campanha e remediacao operacional;
- consulta em linguagem natural sobre o negocio do evento;
- recomendacoes de acao comercial e operacional;
- biblioteca padronizada de metricas de negocio;
- camada analitica que cruza aquisicao, receita, presenca e margem.

### Dependencias

- instrumentacao de eventos desde as fases anteriores;
- historico confiavel de dados;
- taxonomia comum entre modulos;
- governanca de acesso e uso de dados.

### Metricas De Sucesso

- aumento de receita assistida por recomendacao;
- reducao do tempo de analise manual;
- identificacao antecipada de riscos;
- adocao real de insights por operacao e gestao;
- crescimento da recompra e da eficiencia de campanha.

### Riscos

- IA sem base confiavel gerar sugestoes ruins;
- automacao demais criar ruido em vez de ganho;
- metricas inconsistentes contaminarem decisoes;
- falta de governanca sobre alertas, modelos e permissoes.

## Sequenciamento Estrategico

O roadmap deve obedecer a esta logica:

- primeiro, construir confiabilidade estrutural;
- depois, capturar a transacao central;
- em seguida, dominar a operacao ao vivo;
- depois, consolidar a unidade economica do evento;
- por fim, transformar dado em vantagem composta.

Se uma fase nao alimentar a seguinte, ela foi desenhada errado. O Animalz Events precisa crescer como sistema operacional integrado, nao como marketplace de features.
