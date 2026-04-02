# Animalz Events Redesign

## 1. Diagnostico da referencia

### Reference video
- Absorvido: contraste cinematografico, profundidade por imagem, composicao escura premium, motion sutil com senso de valor.
- Traducao: a energia visual vira uma camada editorial de um produto operacional mais robusto.
- Nao copiar literalmente: clima social/party-first, enquadramentos especificos, narrativa de app de convite.

### Reference mobile UI
- Absorvido: tipografia marcante, full-bleed media, overlays transluidos, CTA simples e fortes, status premium no mobile.
- Traducao: o mobile da Animalz vira um companion premium de acesso, agenda, credencial e experiencia no evento.
- Nao copiar literalmente: sem semantica de convite casual, sem visual de social app, sem linguagem de festa.

### Official logo
- Absorvido: energia diagonal, senso de velocidade, preto profundo, roxo premium, dourado controlado, identidade proprietaria.
- Traducao: a marca orienta um sistema premium de operacao de eventos, com assinatura visual forte e sobria.
- Nao copiar literalmente: sem exagero de neon, chamas, efeitos gratuitos ou ornamentacao barulhenta.

## 2. Brand UI direction

- Conceito oficial: `editorial command`.
- Posicionamento visual: uma plataforma operacional premium para eventos de alta performance.
- Tensao central:
  front mais aspiracional,
  mobile mais imersivo,
  backoffice mais executivo.
- Principios:
  sistema primeiro,
  precisao premium,
  poder editorial,
  calma operacional,
  consistencia tematizavel.

## 3. Product architecture

### Front publico
- Homepage institucional/comercial
- Catalogo de eventos
- Pagina individual de evento
- Checkout / inscricao
- Area publica do participante

### App mobile do participante
- Home contextual
- Evento / credencial
- Agenda / programacao
- Mapa / informacoes
- Perfil / configuracoes

### Backoffice do produtor
- Dashboard executivo
- Eventos
- Vendas e inscricoes
- Lotes e cupons
- Credenciamento e check-in
- Participantes / CRM
- Comunicacao
- Equipe e operacao
- Fornecedores
- Financeiro
- Documentos e governanca
- Branding / configuracoes

### Logica de navegacao
- Front: descobrir -> avaliar -> converter -> acessar.
- Mobile: abrir -> validar status -> navegar no evento -> receber comunicacao.
- Backoffice: monitorar -> agir por modulo -> controlar por evento -> registrar governanca.

## 4. Design system

### Cores
- Base: pitch black, carbon, graphite, steel mist, refined bone.
- Assinatura: animalz purple, night plum, controlled gold, champagne line.
- Sistema: success, warning, critical, info, mute.

### Tipografia
- Display: headlines comprimidas, energicas, cinematograficas.
- Interface: leitura limpa e tecnica para tabelas, filtros, forms e dashboards.

### Estrutura
- Grid: 12 colunas no web, 4 colunas logicas no mobile.
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72 / 96.
- Radius: 18-20 para componentes, 28-32 para hero/editorial.
- Shadows: profundidade longa e controlada, sem glow infantil.

### Componentes principais
- CTA primario / secundario / ghost
- Tabelas refinadas
- Filtros por chip
- Badges premium
- Cards de comando
- Skeletons premium

## 5. Category theme logic

- Motorsport: metal, telemetria, contraste frio, velocidade mecanica.
- Festival: dourados mais quentes, plum profundo, editorial caloroso.
- Tactical: oliva, fumaça, leitura utilitaria, tom mission-grade.
- Fight: sombras densas, acentos quentes, intensidade controlada.

Regra: o tema muda a atmosfera, nao a gramatica do produto.

## 6. Wireframes de alto nivel

- Front: hero, descoberta, storytelling de evento, checkout, area do participante.
- Mobile: credencial, agenda, mapa, informacoes, perfil.
- Backoffice: shell executiva, cards KPI, workspace principal, trilho de governanca.

## 7. UI final

- Front: sistema editorial premium, com maior autoridade de marca e conversao.
- Mobile: acesso premium, status, clareza e imersao.
- Backoffice: cockpit executivo, confiavel, modular, caro e operacional.

## Implementacao no repo

- Home publica redesenhada em `src/pages/public/HomePage.tsx`
- Documento de direcao em `docs/animalz-redesign.md`
