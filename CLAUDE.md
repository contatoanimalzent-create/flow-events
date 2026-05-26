# Pulse — CLAUDE.md

## Projeto
**Pulse** — plataforma de gestão de eventos (SaaS). Stack: React 18 + TypeScript + Vite + Tailwind + Supabase.

## Design System
Design escuro com acento **azul #0A1AFF**. Referências primárias de UI:

- **Linear** → `C:\Users\anima\Documents\design-md\design-md\linear.app\DESIGN.md` — base do sistema: tipografia, densidade, dark mode
- **Vercel** → `C:\Users\anima\Documents\design-md\design-md\vercel\DESIGN.md` — grids, contraste, hierarquia visual
- **Stripe** → `C:\Users\anima\Documents\design-md\design-md\stripe\DESIGN.md` — formulários, tabelas, fluxos financeiros
- **Supabase** → `C:\Users\anima\Documents\design-md\design-md\supabase\DESIGN.md` — dashboards, KPIs, status badges

Referências secundárias disponíveis (73 marcas total) em `C:\Users\anima\Documents\design-md\design-md\`.

Ao criar UI: ler o DESIGN.md da(s) marca(s) de referência e aplicar tokens, componentes e princípios. Pode-se combinar 2 marcas como referência híbrida (ex: "Linear + Stripe para a tela de vendas").

## Animações — GSAP Skills
Skills oficiais GSAP em `C:\Users\anima\Documents\app\gsap-skills\skills\`

| Skill | Quando usar |
|---|---|
| `gsap-core` | Tweens, easing, stagger, matchMedia |
| `gsap-react` | useGSAP hook, cleanup, refs no React 18 |
| `gsap-scrolltrigger` | Scroll-driven, parallax, pinning |
| `gsap-timeline` | Sequências coordenadas |
| `gsap-plugins` | Flip, Draggable, MorphSVG |
| `gsap-performance` | Otimização, will-change, force3D |

Ao criar animações: ler o SKILL.md correspondente antes de escrever código.
Smooth scroll: usar **Lenis** (`C:\Users\anima\Documents\app\darkroom\lenis\`) + react-lenis.

## Regras
- Cor de acento sempre **#0A1AFF** (nunca trocar por azul padrão Tailwind)
- Fundo primário dark: `#0A0A0A` / `#111111`
- Font: Inter (ou sistema)
- Não criar arquivos de documentação sem pedido explícito
- Não adicionar comentários óbvios no código
