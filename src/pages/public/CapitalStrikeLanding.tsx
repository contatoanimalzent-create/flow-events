import { useState } from 'react'
import { ArrowRight, Crosshair, Shield, Users } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { useSeoMeta } from '@/shared/lib'
import { CapitalStrikeRegistrationForm } from '@/features/events/components/CapitalStrikeRegistrationForm'

export function CapitalStrikeLanding() {
  const [showForm, setShowForm] = useState(false)
  const [selectedArmy, setSelectedArmy] = useState<'coalizao' | 'alianca' | null>(null)

  useSeoMeta({
    title: 'CAPITAL STRIKE — A ORIGEM | Animalz Events',
    description: '1000 operadores. Brasília. Duas frentes. A guerra começou. Escolha seu lado.',
    image: 'https://images.unsplash.com/photo-1503243191312-c1861d3a6edb?w=1920&q=80&fit=crop',
    url: typeof window !== 'undefined' ? window.location.href : '/capital-strike',
  })

  return (
    <PublicLayout>
      {showForm && selectedArmy ? (
        <CapitalStrikeRegistrationForm
          army={selectedArmy}
          onBack={() => {
            setShowForm(false)
            setSelectedArmy(null)
          }}
        />
      ) : (
        <>
          {/* HERO */}
          <section className="relative h-screen min-h-screen w-full overflow-hidden bg-[#0a0908]">
            {/* Background video/image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1503243191312-c1861d3a6edb?w=1920&q=80&fit=crop)',
                backgroundBlendMode: 'multiply',
              }}
            >
              <div className="absolute inset-0 bg-[rgba(10,9,8,0.7)]" />
            </div>

            {/* Hero content */}
            <div className="relative z-10 flex h-full items-center justify-center px-5">
              <div className="max-w-4xl text-center">
                <div className="animate-pulse">
                  <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] font-black leading-none tracking-[-0.05em] text-white">
                    CAPITAL STRIKE
                  </h1>
                  <h2 className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] font-semibold leading-none tracking-[-0.04em] text-[#FFC107]">
                    A ORIGEM
                  </h2>
                </div>
                <p className="mt-8 text-xl font-light text-white/80 md:text-2xl">
                  A guerra começou.
                </p>
                <p className="mt-4 max-w-2xl mx-auto text-base text-white/60 md:text-lg">
                  1000 operadores. Brasília. Dois exércitos. Uma batalha que decidirá o futuro.
                </p>

                <button
                  onClick={() => {
                    document.getElementById('armies')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="mt-12 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-[#0a0908] transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,193,7,0.3)]"
                >
                  Escolha seu lado
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </div>
          </section>

          {/* CONTEXTO */}
          <section className="bg-[#0a0908] px-5 py-20 md:px-10 lg:px-16 lg:py-28">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#f0ebe2]">
                O Conflito
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#9a9088]">
                Brasília nunca viu algo assim. Em 6, 7 e 8 de junho, dois exércitos se enfrentarão em operações táticas reais.
                Missões simultâneas, objetivos estratégicos, combate com precisão. Mais de 1000 operadores divididos em duas frentes,
                cada uma lutando pela supremacia.
              </p>
              <p className="mt-5 text-lg leading-8 text-[#9a9088]">
                Isto não é um jogo casual. É uma experiência imersiva de airsoft que testa estratégia, tática, resistência e trabalho
                em equipe. Você escolhe seu lado, mas a vitória depende do coletivo.
              </p>
            </div>
          </section>

          {/* EXÉRCITOS */}
          <section id="armies" className="bg-[#080706] px-5 py-20 md:px-10 lg:px-16 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-center font-display text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#f0ebe2]">
                Escolha seu Exército
              </h2>

              <div className="mt-16 grid gap-8 md:grid-cols-2">
                {/* COALIZÃO */}
                <div className="group rounded-[2rem] border border-[#FFC107]/20 bg-gradient-to-br from-[#FFC107]/10 to-[#FFC107]/5 p-8 transition-all hover:border-[#FFC107]/40 hover:shadow-[0_20px_60px_rgba(255,193,7,0.15)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC107]/20">
                      <Shield className="h-7 w-7 text-[#FFC107]" />
                    </div>
                    <div>
                      <h3 className="font-display text-3xl font-bold text-[#FFC107]">COALIZÃO</h3>
                      <p className="text-sm text-[#6a6058]">500 operadores</p>
                    </div>
                  </div>

                  <p className="mt-6 text-base leading-7 text-[#9a9088]">
                    Estratégia defensiva. Controle territorial. Resistência até o final. A Coalizão constrói fortalezas e segura posições.
                  </p>

                  <div className="mt-8 space-y-3">
                    {['Identidade amarela', 'Briefing pré-operação', 'Suporte tático', 'Vitória coletiva'].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#FFC107]" />
                        <span className="text-sm text-[#9a9088]">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedArmy('coalizao')
                      setShowForm(true)
                    }}
                    className="mt-8 w-full rounded-full bg-[#FFC107] py-3.5 text-sm font-semibold text-[#0a0908] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,193,7,0.28)]"
                  >
                    Entrar na Coalizão
                  </button>
                </div>

                {/* ALIANÇA */}
                <div className="group rounded-[2rem] border border-[#2196F3]/20 bg-gradient-to-br from-[#2196F3]/10 to-[#2196F3]/5 p-8 transition-all hover:border-[#2196F3]/40 hover:shadow-[0_20px_60px_rgba(33,150,243,0.15)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2196F3]/20">
                      <Crosshair className="h-7 w-7 text-[#2196F3]" />
                    </div>
                    <div>
                      <h3 className="font-display text-3xl font-bold text-[#2196F3]">ALIANÇA</h3>
                      <p className="text-sm text-[#6a6058]">500 operadores</p>
                    </div>
                  </div>

                  <p className="mt-6 text-base leading-7 text-[#9a9088]">
                    Ofensiva agressiva. Mobilidade tática. Movimento rápido. A Aliança avança, conquista e domina o campo.
                  </p>

                  <div className="mt-8 space-y-3">
                    {['Identidade azul', 'Briefing pré-operação', 'Suporte tático', 'Vitória coletiva'].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#2196F3]" />
                        <span className="text-sm text-[#9a9088]">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedArmy('alianca')
                      setShowForm(true)
                    }}
                    className="mt-8 w-full rounded-full bg-[#2196F3] py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(33,150,243,0.28)]"
                  >
                    Entrar na Aliança
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* EXPERIÊNCIA */}
          <section className="bg-[#0a0908] px-5 py-20 md:px-10 lg:px-16 lg:py-28">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-12 lg:grid-cols-3">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFC107]/10">
                    <Users className="h-8 w-8 text-[#FFC107]" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-[#f0ebe2]">1000+ Operadores</h3>
                  <p className="mt-2 text-base text-[#9a9088]">Maior evento de airsoft tático da região. Operações em escala real.</p>
                </div>

                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2196F3]/10">
                    <Shield className="h-8 w-8 text-[#2196F3]" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-[#f0ebe2]">Missões Reais</h3>
                  <p className="mt-2 text-base text-[#9a9088]">Objetivos estratégicos, combate simultâneo, vitória coletiva.</p>
                </div>

                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c49a50]/10">
                    <Crosshair className="h-8 w-8 text-[#c49a50]" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-[#f0ebe2]">3 Dias Completos</h3>
                  <p className="mt-2 text-base text-[#9a9088]">6, 7 e 8 de junho. Operações contínuas de 8h às 18h.</p>
                </div>
              </div>
            </div>
          </section>

          {/* INFORMAÇÕES */}
          <section className="bg-[#080706] px-5 py-20 md:px-10 lg:px-16 lg:py-28">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-display text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#f0ebe2]">
                Informações do Evento
              </h2>

              <div className="mt-12 space-y-8">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.3em] text-[#c49a50]">Local</h3>
                  <p className="mt-3 text-lg text-[#f0ebe2]">Centro de Brasília — DF</p>
                  <p className="mt-1 text-base text-[#9a9088]">Centro Administrativo de Brasília</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-[0.3em] text-[#c49a50]">Datas</h3>
                  <p className="mt-3 text-lg text-[#f0ebe2]">6, 7 e 8 de junho de 2026</p>
                  <p className="mt-1 text-base text-[#9a9088]">8h às 18h cada dia</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-[0.3em] text-[#c49a50]">Capacidade</h3>
                  <p className="mt-3 text-lg text-[#f0ebe2]">1000 operadores</p>
                  <p className="mt-1 text-base text-[#9a9088]">500 por exército. Inscrições limitadas.</p>
                </div>

                <div>
                  <h3 className="text-sm uppercase tracking-[0.3em] text-[#c49a50]">Preço</h3>
                  <p className="mt-3 text-lg text-[#f0ebe2]">R$ 299,00</p>
                  <p className="mt-1 text-base text-[#9a9088]">Três dias de operação completos</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section className="bg-[#0a0908] px-5 py-20 md:px-10 lg:px-16 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-[clamp(2.4rem,4vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#f0ebe2]">
                Pronto para a batalha?
              </h2>
              <p className="mt-6 text-lg text-[#9a9088]">
                Escolha seu exército, preencha sua inscrição e prepare-se para a maior operação tática de airsoft do Brasil.
              </p>

              <button
                onClick={() => {
                  document.getElementById('armies')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#c49a50] px-8 py-4 text-lg font-semibold text-[#0a0908] transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(196,154,80,0.3)]"
              >
                Escolha seu lado agora
                <ArrowRight className="h-6 w-6" />
              </button>
            </div>
          </section>
        </>
      )}
    </PublicLayout>
  )
}
