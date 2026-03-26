export function PublicFooter() {
  return (
    <footer className="border-t border-bg-border/80 bg-[linear-gradient(180deg,rgba(244,238,229,0.74),rgba(239,230,215,0.96))]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 text-text-secondary md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-16 lg:py-16">
          <div>
            <div className="text-[11px] uppercase tracking-[0.34em] text-[#8e7f68]">Premium experiences ecosystem</div>
            <div className="mt-4 font-display text-[3.6rem] font-semibold leading-[0.9] tracking-[-0.05em] text-text-primary">
              Animalz Events
            </div>
          <p className="mt-5 max-w-xl text-sm leading-7 md:text-base">
            Uma camada para experiencias, cultura, lifestyle e hospitalidade com curadoria, venda, operacao, CRM e growth sob a mesma assinatura premium.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Explorar</div>
            <div className="mt-4 grid gap-3 text-sm">
              <a href="/events" className="transition-colors hover:text-text-primary">Eventos</a>
              <a href="/about" className="transition-colors hover:text-text-primary">Sobre</a>
              <a href="/create-event" className="transition-colors hover:text-text-primary">Criar evento</a>
              <a href="/contact" className="transition-colors hover:text-text-primary">Contato</a>
              <a href="/terms" className="transition-colors hover:text-text-primary">Termos</a>
              <a href="/privacy" className="transition-colors hover:text-text-primary">Privacidade</a>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Presenca</div>
            <div className="mt-4 grid gap-3 text-sm">
              <a href="/contact" className="transition-colors hover:text-text-primary">Parcerias de marca</a>
              <a href="/contact" className="transition-colors hover:text-text-primary">Concierge para produtores</a>
              <a href="/login" className="transition-colors hover:text-text-primary">Entrar na plataforma</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
