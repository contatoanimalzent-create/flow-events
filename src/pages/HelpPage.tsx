export function HelpPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl text-text-primary leading-none mb-1">
          CENTRAL DE AJUDA<span className="text-brand-acid">.</span>
        </h1>
        <p className="text-text-muted text-xs font-mono tracking-wider">Documentação, guias e suporte</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'Guia de Inicio',
            description: 'Comece a usar a plataforma em 5 minutos. Crie sua conta, configure seu perfil e publique seu primeiro evento.',
            icon: '🚀',
          },
          {
            title: 'Criar Eventos',
            description: 'Aprenda como criar, configurar e gerenciar seus eventos. De eventos gratuitos a experiências VIP.',
            icon: '📅',
          },
          {
            title: 'Vendas de Ingressos',
            description: 'Domine as estrategias de venda. Taxas, batches, promocoes e tudo que voce precisa saber.',
            icon: '🎫',
          },
          {
            title: 'Check-in e Operacao',
            description: 'Gerencie o check-in no dia do evento, controle de staff, validacao de ingressos e integrações.',
            icon: '✅',
          },
          {
            title: 'Relatorios e Dados',
            description: 'Entenda seus numeros. Analytics, relatorios de vendas, dados de presenca e insights de publico.',
            icon: '📊',
          },
          {
            title: 'Pagamentos e Financeiro',
            description: 'Como funcionam as taxas, quando voce recebe seu dinheiro, e como gerenciar seu fluxo financeiro.',
            icon: '💰',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="card p-6 hover:shadow-card-deep transition-shadow cursor-pointer"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
            <p className="text-sm text-text-secondary">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 card p-8 border border-bg-border bg-bg-elevated">
        <h2 className="font-display text-2xl text-text-primary mb-4">Nao encontrou o que procurava?</h2>
        <p className="text-text-secondary mb-6">
          Nossa equipe de suporte esta aqui para ajudar. Envie sua pergunta ou acesse nossa documentacao completa.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-acid text-bg-primary font-medium text-sm transition-all hover:-translate-y-0.5"
          >
            Fale com o Suporte
          </a>
          <a
            href="https://docs.animalz.events"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-bg-border text-text-primary font-medium text-sm transition-all hover:bg-bg-border"
          >
            Documentacao Completa →
          </a>
        </div>
      </div>
    </div>
  )
}