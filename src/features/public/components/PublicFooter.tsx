export function PublicFooter() {
  return (
    <footer className="border-t border-bg-border bg-[#efe6d7]/92">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-text-secondary md:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-16">
        <div>
          <div className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-text-primary">Animalz Events</div>
          <p className="mt-3 max-w-md text-sm leading-6">
            Curadoria, venda, operacao e inteligencia para experiencias que precisam parecer excepcionais em cada ponto de contato.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm">
          <a href="/events" className="transition-colors hover:text-text-primary">Explorar eventos</a>
          <a href="/terms" className="transition-colors hover:text-text-primary">Termos</a>
          <a href="/privacy" className="transition-colors hover:text-text-primary">Privacidade</a>
          <a href="/contact" className="transition-colors hover:text-text-primary">Contato</a>
        </div>
      </div>
    </footer>
  )
}
