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
          {t('Documentation, guides and support', 'Documentacao, guias e suporte')}
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
            href="https://docs.animalz.events"
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
