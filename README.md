# ANIMALZ EVENTS 🎟️

> Create, sell, operate and scale events beautifully.

Plataforma operacional completa para gestão de eventos — venda de ingressos, credenciamento, check-in, staff, fornecedores, PDV, comunicação e analytics.

## Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Estilo:** Tailwind CSS (design system próprio)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Estado:** Zustand
- **Gráficos:** Recharts

## Começando

### 1. Clone o repositório
```bash
git clone https://github.com/contatoanimalzent-create/flow-events.git
cd flow-events
```

### 2. Instale dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Preencha com suas credenciais do Supabase
```

### 4. Rode o projeto
```bash
npm run dev
```

Acesse: http://localhost:5173

## Login inicial
- **Email:** walteciojr@gmail.com
- **Senha:** 12345678
- ⚠️ Troca de senha obrigatória no primeiro acesso

## Estrutura de pastas

```
src/
├── components/
│   ├── ui/          # Componentes base (Badge, StatCard, EmptyState...)
│   ├── layout/      # Sidebar, Topbar, AppShell, AppRouter
│   └── dashboard/   # Cards do dashboard
├── pages/
│   ├── auth/        # Login, ChangePassword
│   └── ...          # Uma pasta por módulo
├── lib/
│   ├── supabase.ts  # Cliente e tipos
│   ├── utils.ts     # Formatadores e helpers
│   └── store/       # Zustand stores
└── styles/
    └── globals.css  # Design system + Tailwind
```

## Fases de desenvolvimento

- [x] **Fase 0** — Banco de dados (Supabase, 80+ tabelas, RLS, triggers)
- [x] **Fase 1a** — Autenticação, layout, dashboard
- [ ] **Fase 1b** — Eventos, landing page builder, ingressos, checkout
- [ ] **Fase 1c** — Ticket premium + QR, check-in multi-dispositivo
- [ ] **Fase 2** — Credenciamento, staff, ponto, fornecedores
- [ ] **Fase 3** — PDV, estoque, financeiro
- [ ] **Fase 4** — Growth services, ajuda, analytics avançado
