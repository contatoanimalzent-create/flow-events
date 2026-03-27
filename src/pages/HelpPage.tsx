const topics = [
  {
    title: 'Getting started',
    description: 'Start using the platform in five minutes. Create your account, configure your profile and publish your first event.',
    icon: '🚀',
  },
  {
    title: 'Creating events',
    description: 'Learn how to create, configure and manage your events, from free registrations to premium VIP experiences.',
    icon: '📅',
  },
  {
    title: 'Ticket sales',
    description: 'Master revenue strategy, fees, releases, promotions and the commercial details that drive conversion.',
    icon: '🎫',
  },
  {
    title: 'Check-in and operations',
    description: 'Run event-day check-in, staff control, ticket validation and operational integrations with confidence.',
    icon: '✅',
  },
  {
    title: 'Reports and data',
    description: 'Understand your numbers with analytics, sales reporting, attendance data and audience insights.',
    icon: '📊',
  },
  {
    title: 'Payments and finance',
    description: 'See how fees work, when payouts arrive and how to manage your financial flow end to end.',
    icon: '💰',
  },
]

export function HelpPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl text-text-primary leading-none mb-1">
          HELP CENTER<span className="text-brand-acid">.</span>
        </h1>
        <p className="text-text-muted text-xs font-mono tracking-wider">Documentation, guides and support</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((item) => (
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
        <h2 className="font-display text-2xl text-text-primary mb-4">Still need help?</h2>
        <p className="text-text-secondary mb-6">
          Our support team is here to help. Send your question or open the full documentation library.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-acid text-bg-primary font-medium text-sm transition-all hover:-translate-y-0.5"
          >
            Contact support
          </a>
          <a
            href="https://docs.animalz.events"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-bg-border text-text-primary font-medium text-sm transition-all hover:bg-bg-border"
          >
            Full documentation →
          </a>
        </div>
      </div>
    </div>
  )
}
