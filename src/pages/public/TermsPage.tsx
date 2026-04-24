import { ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { PublicReveal } from '@/features/public/components/PublicReveal'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

export function TermsPage() {
  const { isPortuguese } = usePublicLocale()

  const sections = isPortuguese
    ? [
        {
          title: '1. Aceitacao dos termos',
          content: [
            'Ao acessar e usar a plataforma Pulse, você concorda com estes termos. Se não concordar com alguma parte, não utilize o serviço.',
          ],
        },
        {
          title: '2. Licença de uso',
          content: [
            'Concedemos a você uma licença limitada, não exclusiva e revogável para acessar e usar a plataforma para fins pessoais ou comerciais legítimos.',
            'Não é permitido reproduzir, modificar ou usar a plataforma para atividades ilegais, acesso não autorizado ou qualquer prática abusiva.',
          ],
        },
        {
          title: '3. Contas de usuário',
          content: [
            'Algumas funcionalidades exigem cadastro com informações precisas e atualizadas.',
            'Você e responsável por manter suas credenciais seguras e por toda atividade realizada em sua conta.',
          ],
        },
        {
          title: '4. Transações e pagamentos',
          content: [
            'A Pulse viabiliza compras de ingressos entre compradores e produtores, com processamento seguro de pagamentos.',
            'Taxas e condições aplicáveis devem ser apresentadas com clareza antes da confirmação da compra.',
          ],
        },
        {
          title: '5. Propriedade intelectual',
          content: [
            'Textos, imagens, marcas, layouts e demais elementos da plataforma pertencem a Pulse ou aos respectivos licenciadores.',
            'Não é permitido reproduzir ou distribuir esse conteúdo sem autorização prévia.',
          ],
        },
        {
          title: '6. Isencao de responsabilidade',
          content: [
            'A plataforma é disponibilizada na forma em que se encontra, sem garantias absolutas de disponibilidade, segurança ou ausência de erros.',
          ],
        },
        {
          title: '7. Limitacao de responsabilidade',
          content: [
            'Na extensao permitida por lei, a Pulse não responde por danos indiretos, incidentais ou consequentes decorrentes do uso da plataforma.',
          ],
        },
        {
          title: '8. Conduta do usuário',
          content: [
            'Você concorda em usar a plataforma apenas para fins legais e sem violar direitos de terceiros, regras de segurança ou políticas internas.',
          ],
        },
        {
          title: '9. Privacidade',
          content: [
            'O tratamento de dados pessoais segue nossa Política de Privacidade, que deve ser lida em conjunto com estes termos.',
          ],
        },
        {
          title: '10. Alterações nos termos',
          content: [
            'Podemos atualizar estes termos periodicamente. O uso continuo da plataforma após as mudancas representa aceitacao da versao vigente.',
          ],
        },
        {
          title: '11. Lei aplicável',
          content: [
            'Estes termos são regidos pela legislação aplicável ao serviço e as disputas serão tratadas no foro competente, conforme permitido por lei.',
          ],
        },
        {
          title: '12. Contato',
          content: [
            'Para dúvidas sobre estes termos, escreva para support@animalz.events ou acesse nossa página de contato.',
          ],
        },
      ]
    : [
        {
          title: '1. Acceptance of terms',
          content: [
            'By accessing and using the Pulse platform, you agree to these terms. If you do not agree with any part, do not use the service.',
          ],
        },
        {
          title: '2. License to use',
          content: [
            'We grant you a limited, non-exclusive and revocable license to access and use the platform for legitimate personal or commercial purposes.',
            'You may not reproduce, modify or use the platform for illegal activities, unauthorized access or abusive practices.',
          ],
        },
        {
          title: '3. User accounts',
          content: [
            'Some features require registration with accurate and up-to-date information.',
            'You are responsible for keeping your credentials secure and for all activity carried out under your account.',
          ],
        },
        {
          title: '4. Transactions and payments',
          content: [
            'Pulse enables ticket purchases between buyers and organizers, with secure payment processing.',
            'Applicable fees and conditions must be clearly presented before purchase confirmation.',
          ],
        },
        {
          title: '5. Intellectual property',
          content: [
            'Texts, images, brands, layouts and other platform elements belong to Pulse or the respective licensors.',
            'You may not reproduce or distribute this content without prior authorization.',
          ],
        },
        {
          title: '6. Disclaimer',
          content: [
            'The platform is provided as is, without absolute guarantees regarding availability, security or absence of errors.',
          ],
        },
        {
          title: '7. Limitation of liability',
          content: [
            'To the extent permitted by law, Pulse is not liable for indirect, incidental or consequential damages arising from use of the platform.',
          ],
        },
        {
          title: '8. User conduct',
          content: [
            'You agree to use the platform only for lawful purposes and without violating third-party rights, security rules or internal policies.',
          ],
        },
        {
          title: '9. Privacy',
          content: [
            'The processing of personal data follows our Privacy Policy, which should be read together with these terms.',
          ],
        },
        {
          title: '10. Changes to the terms',
          content: [
            'We may update these terms periodically. Continued use of the platform after changes means acceptance of the current version.',
          ],
        },
        {
          title: '11. Governing law',
          content: [
            'These terms are governed by the law applicable to the service, and disputes will be handled in the proper jurisdiction as permitted by law.',
          ],
        },
        {
          title: '12. Contact',
          content: [
            'For questions about these terms, email support@animalz.events or visit our contact page.',
          ],
        },
      ]

  useSeoMeta({
    title: isPortuguese ? 'Termos de uso | Pulse' : 'Terms of use | Pulse',
    description: isPortuguese
      ? 'Conheca os termos e condições de uso da plataforma Pulse.'
      : 'Read the terms and conditions for using the Pulse platform.',
    url: typeof window !== 'undefined' ? window.location.href : '/terms',
  })

  return (
    <PublicLayout>
      <section className="px-5 pb-20 pt-12 md:px-10 lg:px-16 lg:pt-18">
        <div className="mx-auto max-w-3xl">
          <PublicReveal>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-text-muted transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {isPortuguese ? 'Voltar' : 'Back'}
            </a>

            <h1 className="mt-8 font-display text-[clamp(3.2rem,6vw,5.2rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-text-primary">
              {isPortuguese ? 'Termos de uso.' : 'Terms of use.'}
            </h1>

            <p className="mt-6 text-base leading-8 text-text-secondary md:text-lg">
              {isPortuguese
                ? 'Ao usar a plataforma Pulse, você concorda com os seguintes termos. Leia com atenção.'
                : 'By using the Pulse platform, you agree to the following terms. Please read them carefully.'}
            </p>
          </PublicReveal>

          <div className="mt-16 space-y-12">
            {sections.map((section, idx) => (
              <PublicReveal key={section.title} delayMs={idx * 30}>
                <div>
                  <h2 className="font-display text-[1.8rem] font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {section.content.map((paragraph) => (
                      <p key={paragraph} className="text-base leading-7 text-text-secondary">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </PublicReveal>
            ))}
          </div>

          <PublicReveal delayMs={sections.length * 30}>
            <div className="mt-16 rounded-[2.4rem] border border-bg-border bg-bg-card p-8">
              <p className="text-sm leading-7 text-text-secondary">
                <strong className="text-text-primary">{isPortuguese ? 'Ultima atualizacao:' : 'Last updated:'}</strong> {isPortuguese ? 'Marco de 2026' : 'March 2026'}{' '}
                <br className="md:hidden" />
                <span className="hidden md:inline">•</span>{' '}
                <strong className="text-text-primary">{isPortuguese ? 'Versao:' : 'Version:'}</strong> 1.0
              </p>
            </div>
          </PublicReveal>
        </div>
      </section>
    </PublicLayout>
  )
}
