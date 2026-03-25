export function PublicFooter() {
  return (
    <footer className="border-t border-[#ddd1bf] bg-[#efe6d7]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-[#5f5549] md:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-16">
        <div>
          <div className="font-serif text-2xl font-semibold text-[#1f1a15]">Animalz Events</div>
          <p className="mt-3 max-w-md text-sm leading-6">
            Curadoria, venda, operacao e inteligencia para experiencias que precisam parecer excepcionais em cada ponto de contato.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm">
          <a href="/events" className="transition-colors hover:text-[#1f1a15]">Explorar eventos</a>
          <a href="/terms" className="transition-colors hover:text-[#1f1a15]">Termos</a>
          <a href="/privacy" className="transition-colors hover:text-[#1f1a15]">Privacidade</a>
          <a href="/contact" className="transition-colors hover:text-[#1f1a15]">Contato</a>
        </div>
      </div>
    </footer>
  )
}
