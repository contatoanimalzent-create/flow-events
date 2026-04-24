# Animalz Events Redesign

## 1. Diagnostico da referência

### Reference video
- Absorvido: contraste cinematografico, profundidade por imagem, composicao escura premium, motion sutil com senso de valor.
- Tradução: a energia visual vira uma camada editorial de um produto operacional mais robusto.
- Não copiar literalmente: clima social/party-first, enquadramentos especificos, narrativa de app de convite.

### Reference mobile UI
- Absorvido: tipografia marcante, full-bleed media, overlays transluidos, CTA simples e fortes, status premium no mobile.
- Tradução: o mobile da Animalz vira um companion premium de acesso, agenda, credencial e experiência no evento.
- Não copiar literalmente: sem semântica de convite casual, sem visual de social app, sem linguagem de festa.

### Official logo
- Absorvido: energia diagonal, senso de velocidade, preto profundo, roxo premium, dourado controlado, identidade proprietaria.
- Tradução: a marca orienta um sistema premium de operação de eventos, com assinatura visual forte e sóbria.
- Não copiar literalmente: sem exagero de neon, chamas, efeitos gratuitos ou ornamentacao barulhenta.

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

### Front público
- Homepage institucional/comercial
- Catálogo de eventos
- Página individual de evento
- Checkout / inscrição
- Área pública do participante

### App mobile do participante
- Home contextual
- Evento / credencial
- Agenda / programação
- Mapa / informações
- Perfil / configurações

### Backoffice do produtor
- Dashboard executivo
- Eventos
- Vendas e inscrições
- Lotes e cupons
- Credenciamento e check-in
- Participantes / CRM
- Comunicacao
- Equipe e operação
- Fornecedores
- Financeiro
- Documentos e governança
- Branding / configurações

### Lógica de navegação
- Front: descobrir -> avaliar -> converter -> acessar.
- Mobile: abrir -> validar status -> navegar no evento -> receber comunicacao.
- Backoffice: monitorar -> agir por módulo -> controlar por evento -> registrar governança.

## 4. Design system

### Cores
- Base: pitch black, carbon, graphite, steel mist, refined bone.
- Assinatura: animalz purple, night plum, controlled gold, champagne line.
- Sistema: success, warning, critical, info, mute.

### Tipografia
- Display: headlines comprimidas, energicas, cinematograficas.
- Interface: leitura limpa e técnica para tabelas, filtros, forms e dashboards.

### Estrutura
- Grid: 12 colunas no web, 4 colunas logicas no mobile.
- Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 72 / 96.
- Radius: 18-20 para componentes, 28-32 para hero/editorial.
- Shadows: profundidade longa e controlada, sem glow infantil.

### Componentes principais
- CTA primário / secundário / ghost
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

Regra: o tema muda a atmosfera, não a gramatica do produto.

## 6. Wireframes de alto nivel

- Front: hero, descoberta, storytelling de evento, checkout, área do participante.
- Mobile: credencial, agenda, mapa, informações, perfil.
- Backoffice: shell executiva, cards KPI, workspace principal, trilho de governança.

## 7. UI final

- Front: sistema editorial premium, com maior autoridade de marca e conversão.
- Mobile: acesso premium, status, clareza e imersao.
- Backoffice: cockpit executivo, confiável, modular, caro e operacional.

## Implementacao no repo

- Home pública redesenhada em `src/pages/public/HomePage.tsx`
- Documento de direção em `docs/animalz-redesign.md`
