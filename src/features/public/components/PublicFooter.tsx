export function PublicFooter() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.07)] bg-[#080706]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-16 lg:py-16">
        <div>
          <div className="text-[10px] uppercase tracking-[0.34em] text-[#c49a50]">Animalz Events</div>
          <div className="mt-4 font-display text-[3.6rem] font-semibold leading-[0.9] tracking-[-0.05em] text-[#f0ebe2]">
            Animalz Events
          </div>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#6a6058] md:text-base">
            Os melhores eventos de cultura, gastronomia, musica e lifestyle. Compre ingressos com facilidade e garanta seu lugar.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#4a4540]">Explorar</div>
            <div className="mt-4 grid gap-3 text-sm">
              <a href="/events" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Eventos</a>
              <a href="/about" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Sobre</a>
              <a href="/create-event" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Criar evento</a>
              <a href="/contact" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Contato</a>
              <a href="/terms" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Termos</a>
              <a href="/privacy" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Privacidade</a>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-[#4a4540]">Produtores</div>
            <div className="mt-4 grid gap-3 text-sm">
              <a href="/create-event" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Publicar evento</a>
              <a href="/contact" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Parcerias</a>
              <a href="/login" className="text-[#6a6058] transition-colors hover:text-[#f0ebe2]">Entrar na plataforma</a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(255,255,255,0.05)] px-5 py-6 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="text-[11px] text-[#3a3530]">© 2025 Animalz Events. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[#3a3530]">Feito com</span>
            <span className="text-[#c49a50]">♦</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
