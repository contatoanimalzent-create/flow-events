import { useAppLocale } from '@/shared/i18n/app-locale'

const topics = [
  {
    icon: '🚀',
    title: { en: 'Getting started', pt: 'Primeiros passos' },
    description: {
      en: 'Start using the platform in five minutes. Create your account, configure your profile and publish your first event.',
      pt: 'Comece a usar a plataforma em cinco minutos. Crie sua conta, configure seu perfil e publique seu primeiro evento.',
    },
  },
  {
    icon: '📅',
    title: { en: 'Creating events', pt: 'Criando eventos' },
    description: {
      en: 'Learn how to create, configure and manage your events, from free registrations to premium VIP experiences.',
      pt: 'Aprenda a criar, configurar e operar seus eventos, de inscricoes gratuitas a experiencias VIP de alto valor.',
    },
  },
  {
    icon: '🎫',
    title: { en: 'Ticket sales', pt: 'Vendas de ingressos' },
    description: {
      en: 'Master revenue strategy, fees, releases, promotions and the commercial details that drive conversion.',
      pt: 'Domine estrategia de receita, taxas, lotes, promocoes e os detalhes comerciais que movem conversao.',
    },
  },
  {
    icon: '✅',
    title: { en: 'Check-in and operations', pt: 'Credenciamento e operacao' },
    description: {
      en: 'Run event-day check-in, staff control, ticket validation and operational integrations with confidence.',
      pt: 'Conduza credenciamento, equipe, validacao de ingressos e integracoes operacionais com seguranca.',
    },
  },
  {
    icon: '📊',
    title: { en: 'Reports and data', pt: 'Relatorios e dados' },
    description: {
      en: 'Understand your numbers with analytics, sales reporting, attendance data and audience insights.',
      pt: 'Entenda seus numeros com analises, vendas, presenca e inteligencia de publico.',
    },
  },
  {
    icon: '💰',
    title: { en: 'Payments and finance', pt: 'Pagamentos e financeiro' },
    description: {
      en: 'See how fees work, when payouts arrive and how to manage your financial flow end to end.',
      pt: 'Veja como as taxas funcionam, quando os repasses chegam e como gerir o fluxo financeiro de ponta a ponta.',
    },
  },
]

export function HelpPage() {
  const { t, isPortuguese } = useAppLocale()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="mb-1 font-display text-4xl leading-none text-text-primary">
          {t('HELP CENTER', 'CENTRO DE AJUDA')}
          <span className="text-brand-acid">.</span>
        </h1>
        <p className="text-xs font-mono tracking-wider text-text-muted">
          {t('AI assistance, guides and support', 'AI assistente, guias e suporte')}
        </p>
      </div>

      <div className="mb-6 card p-6">
        <div className="text-[11px] uppercase tracking-[0.32em] text-[#4285F4]">{t('Operational AI', 'AI operacional')}</div>
        <h2 className="mt-3 font-display text-3xl leading-none text-text-primary">
          {t('Help inside every module.', 'Ajuda dentro de cada modulo.')}
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary">
          {t(
            'Open the AI assistant in the admin shell to ask where to work, how to register staff, when to use POS, or how to separate sales from inventory. It now keeps operational memory from previous questions to improve the next answers.',
            'Abra a AI no shell interno para perguntar onde operar, como cadastrar staff, quando usar PDV ou como separar venda de estoque. Ela agora guarda memoria operacional das duvidas anteriores para responder melhor nas proximas.',
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((item) => (
          <div key={item.title.en} className="card cursor-pointer p-6 transition-shadow hover:shadow-card-deep">
            <div className="mb-4 text-4xl">{item.icon}</div>
            <h3 className="mb-2 font-semibold text-text-primary">{isPortuguese ? item.title.pt : item.title.en}</h3>
            <p className="text-sm text-text-secondary">{isPortuguese ? item.description.pt : item.description.en}</p>
          </div>
        ))}
      </div>

      {/* ── Especificações de mídia ─────────────────────────── */}
      <div className="mt-8 card p-6 space-y-5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
            {t('Producer reference', 'Referencia do produtor')}
          </div>
          <h2 className="font-display text-2xl leading-none text-text-primary">
            {t('Image & video specs', 'Especificacoes de imagem e video')}
            <span className="text-brand-acid">.</span>
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {t(
              'Use these specs when preparing assets for events, logos and public pages.',
              'Use essas medidas ao preparar os arquivos para eventos, logos e paginas publicas.',
            )}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {([
            { icon: '🖼️', label: t('Event cover','Capa do evento'),      spec: '1920 × 1080 px', formats: 'JPG · PNG · WebP',  size: 'max 5 MB',  ratio: '16:9',  use: t('Hero on public page','Hero da pagina publica') },
            { icon: '📱', label: t('Mobile banner','Banner mobile'),      spec: '1080 × 1350 px', formats: 'JPG · PNG · WebP',  size: 'max 5 MB',  ratio: '4:5',   use: t('Social media feed','Feed de redes sociais') },
            { icon: '🔲', label: t('Thumbnail','Thumb / miniatura'),      spec: '800 × 800 px',   formats: 'JPG · PNG',         size: 'max 2 MB',  ratio: '1:1',   use: t('Listings and cards','Listagens e cards') },
            { icon: '🎯', label: t('Event logo','Logo do evento'),         spec: '400 × 400 px',   formats: 'PNG transparente',  size: 'max 1 MB',  ratio: '1:1',   use: t('Header and badge','Header e badge') },
            { icon: '🎬', label: t('Hero video (loop)','Video hero loop'), spec: '1920 × 1080 px', formats: 'MP4 · WebM',        size: 'max 50 MB', ratio: '16:9',  use: t('Max 60 sec loop','Loop maximo 60s') },
            { icon: '📹', label: t('Vertical video','Video vertical'),    spec: '1080 × 1920 px', formats: 'MP4',               size: 'max 30 MB', ratio: '9:16',  use: t('Reels and Stories','Reels e Stories') },
            { icon: '🏢', label: t('Org logo','Logo da organizacao'),      spec: '400 × 400 px',   formats: 'PNG · SVG',         size: 'max 2 MB',  ratio: '1:1',   use: t('Sidebar and emails','Sidebar e emails') },
            { icon: '🎨', label: t('Email banner','Banner de email'),      spec: '600 × 300 px',   formats: 'JPG · PNG',         size: 'max 1 MB',  ratio: '2:1',   use: t('Transactional emails','Emails transacionais') },
            { icon: '📸', label: t('Gallery photo','Foto da galeria'),     spec: '1200 × 800 px',  formats: 'JPG · PNG · WebP',  size: 'max 8 MB',  ratio: '3:2',   use: t('Event gallery','Galeria do evento') },
          ] as const).map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-[18px] border border-bg-border bg-bg-secondary/50 p-4">
              <span className="text-2xl leading-none mt-0.5 shrink-0">{item.icon}</span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-[12px] font-semibold text-text-primary">{item.label}</div>
                <div className="font-mono text-[12px] font-bold text-brand-acid">{item.spec}</div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-text-muted">
                  <span>{item.formats}</span>
                  <span className="text-bg-border">·</span>
                  <span>{item.size}</span>
                  <span className="text-bg-border">·</span>
                  <span>{item.ratio}</span>
                </div>
                <div className="text-[10px] text-text-muted italic">{item.use}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[14px] border border-status-warning/20 bg-status-warning/6 px-4 py-3 text-[11px] text-status-warning leading-relaxed">
          💡 {t(
            'All images are automatically compressed for the web. Use original high-resolution files — the platform handles optimization.',
            'Todas as imagens sao comprimidas automaticamente para web. Envie os arquivos originais em alta resolucao — a plataforma faz a otimizacao.',
          )}
        </div>
      </div>

      <div className="mt-12 card border border-bg-border bg-bg-elevated p-8">
        <h2 className="mb-4 font-display text-2xl text-text-primary">{t('Still need help?', 'Ainda precisa de ajuda?')}</h2>
        <p className="mb-6 text-text-secondary">
          {t(
            'Our support team is here to help. Send your question or open the full documentation library.',
            'Nosso time de suporte esta aqui para ajudar. Envie sua pergunta ou abra a biblioteca completa de documentacao.',
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-brand-acid px-6 py-3 text-sm font-medium text-bg-primary transition-all hover:-translate-y-0.5"
          >
            {t('Contact support', 'Falar com suporte')}
          </a>
          <a
            href="https://docs.pulse.events"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-bg-border px-6 py-3 text-sm font-medium text-text-primary transition-all hover:bg-bg-border"
          >
            {t('Full documentation ->', 'Documentacao completa ->')}
          </a>
        </div>
      </div>
    </div>
  )
}
