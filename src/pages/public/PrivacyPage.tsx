import { ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { PublicReveal } from '@/features/public/components/PublicReveal'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

export function PrivacyPage() {
  const { isPortuguese } = usePublicLocale()

  const sections = isPortuguese
    ? [
        {
          title: '1. Sobre esta política',
          content: [
            'Esta Política de Privacidade descreve como a Pulse coleta, usa, armazena e protege suas informações pessoais quando você utiliza nossa plataforma.',
          ],
        },
        {
          title: '2. Informações que coletamos',
          content: [
            'Coletamos informações de duas formas principais.',
            'Informações fornecidas diretamente: nome, email, telefone, endereço e dados de pagamento quando você se cadastra, compra ingressos ou cria um evento.',
            'Informações coletadas automaticamente: dados de uso da plataforma, endereço IP, tipo de navegador e cookies para melhorar sua experiência.',
          ],
        },
        {
          title: '3. Como usamos seus dados',
          content: [
            'Usamos suas informações para processar transações, enviar confirmações de compra, melhorar sua experiência, comunicar atualizações sobre eventos e ingressos, prevenir fraude e cumprir obrigações legais.',
            'Com seu consentimento, também podemos enviar promoções e novidades sobre novos eventos.',
          ],
        },
        {
          title: '4. Base legal para tratamento',
          content: [
            'Processamos seus dados com base em consentimento, execução de contrato, obrigações legais e interesses legítimos relacionados a segurança e melhoria do serviço.',
          ],
        },
        {
          title: '5. Compartilhamento de dados',
          content: [
            'Compartilhamos suas informações apenas quando necessário, como com processadores de pagamento, produtores de eventos e autoridades competentes quando exigido por lei.',
            'Nunca vendemos seus dados para terceiros.',
          ],
        },
        {
          title: '6. Segurança de dados',
          content: [
            'Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia, controles de acesso e monitoramento continuo.',
            'Nenhum sistema é totalmente imune a riscos. Por isso, recomendamos que você proteja suas credenciais e nos avise sobre qualquer acesso não autorizado.',
          ],
        },
        {
          title: '7. Retenção de dados',
          content: [
            'Mantemos seus dados pelo tempo necessário para operar a plataforma, cumprir exigências legais e atender obrigações fiscais e contratuais.',
          ],
        },
        {
          title: '8. Seus direitos',
          content: [
            'Você pode solicitar acesso, correcao, exclusao, portabilidade e revisao do uso de seus dados, além de revogar consentimentos quando aplicável.',
            'Para exercer esses direitos, escreva para privacy@animalz.events.',
          ],
        },
        {
          title: '9. Cookies',
          content: [
            'Usamos cookies para manter sua sessão ativa, lembrar preferências e entender como a plataforma é utilizada.',
            'Você pode gerenciar cookies no seu navegador, embora isso possa afetar algumas funcionalidades.',
          ],
        },
        {
          title: '10. Transferencias internacionais',
          content: [
            'Seus dados podem ser processados em servidores localizados em outros países. Nesses casos, adotamos salvaguardas adequadas para proteger suas informações.',
          ],
        },
        {
          title: '11. Menores de idade',
          content: [
            'Não coletamos intencionalmente dados de menores sem autorização legal. Se identificarmos uma coleta inadequada, adotaremos as medidas necessárias para remover esses dados.',
          ],
        },
        {
          title: '12. Contato e reclamacoes',
          content: [
            'Para dúvidas sobre privacidade, fale com privacy@animalz.events ou use nossa página de contato.',
            'Se necessário, você também pode procurar a autoridade competente de protecao de dados.',
          ],
        },
        {
          title: '13. Atualizações desta política',
          content: [
            'Esta política pode ser atualizada periodicamente. Alterações relevantes poderao ser comunicadas por email ou na própria plataforma.',
          ],
        },
      ]
    : [
        {
          title: '1. About this policy',
          content: [
            'This Privacy Policy describes how Pulse collects, uses, stores and protects your personal information when you use our platform.',
          ],
        },
        {
          title: '2. Information we collect',
          content: [
            'We collect information in two main ways.',
            'Information you provide directly: name, email, phone, address and payment details when you sign up, buy tickets or create an event.',
            'Information collected automatically: platform usage data, IP address, browser type and cookies used to improve your experience.',
          ],
        },
        {
          title: '3. How we use your data',
          content: [
            'We use your information to process transactions, send purchase confirmations, improve your experience, communicate updates about events and tickets, prevent fraud and comply with legal obligations.',
            'With your consent, we may also send promotions and updates about new events.',
          ],
        },
        {
          title: '4. Legal basis for processing',
          content: [
            'We process your data based on consent, contract performance, legal obligations and legitimate interests related to security and service improvement.',
          ],
        },
        {
          title: '5. Data sharing',
          content: [
            'We share your information only when necessary, such as with payment processors, event organizers and competent authorities when required by law.',
            'We never sell your data to third parties.',
          ],
        },
        {
          title: '6. Data security',
          content: [
            'We adopt technical and organizational measures to protect your data, including encryption, access controls and continuous monitoring.',
            'No system is completely immune to risk, so we recommend protecting your credentials and notifying us about any unauthorized access.',
          ],
        },
        {
          title: '7. Data retention',
          content: [
            'We keep your data for as long as necessary to operate the platform, comply with legal requirements and meet tax and contractual obligations.',
          ],
        },
        {
          title: '8. Your rights',
          content: [
            'You may request access, correction, deletion, portability and review of how your data is used, and you may revoke consent when applicable.',
            'To exercise these rights, email privacy@animalz.events.',
          ],
        },
        {
          title: '9. Cookies',
          content: [
            'We use cookies to keep your session active, remember preferences and understand how the platform is used.',
            'You can manage cookies in your browser, although doing so may affect some functionality.',
          ],
        },
        {
          title: '10. International transfers',
          content: [
            'Your data may be processed on servers located in other countries. In those cases, we adopt appropriate safeguards to protect your information.',
          ],
        },
        {
          title: '11. Minors',
          content: [
            'We do not intentionally collect data from minors without proper authorization. If we identify an improper collection, we will take the necessary steps to remove that data.',
          ],
        },
        {
          title: '12. Contact and complaints',
          content: [
            'For privacy questions, contact privacy@animalz.events or use our contact page.',
            'If necessary, you may also contact the relevant data protection authority.',
          ],
        },
        {
          title: '13. Updates to this policy',
          content: [
            'This policy may be updated periodically. Relevant changes may be communicated by email or within the platform itself.',
          ],
        },
      ]

  useSeoMeta({
    title: isPortuguese ? 'Política de privacidade | Pulse' : 'Privacy policy | Pulse',
    description: isPortuguese
      ? 'Saiba como a Pulse coleta, usa e protege seus dados pessoais.'
      : 'Learn how Pulse collects, uses and protects your personal data.',
    url: typeof window !== 'undefined' ? window.location.href : '/privacy',
  })

  return (
    <PublicLayout>
      <section className="px-5 pb-20 pt-12 md:px-10 lg:px-16 lg:pt-18">
        <div className="mx-auto max-w-3xl">
          <PublicReveal>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[#8b7c69] transition-colors hover:text-[#1f1a15]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {isPortuguese ? 'Voltar' : 'Back'}
            </a>

            <h1 className="mt-8 font-display text-[clamp(3.2rem,6vw,5.2rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[#1f1a15]">
              {isPortuguese ? 'Sua privacidade importa.' : 'Your privacy matters.'}
            </h1>

            <p className="mt-6 text-base leading-8 text-[#5f5549] md:text-lg">
              {isPortuguese
                ? 'Na Pulse, protegemos seus dados com seriedade. Esta política explica como coletamos, usamos e mantemos seguras suas informações.'
                : 'At Pulse, we take your data seriously. This policy explains how we collect, use and protect your information.'}
            </p>
          </PublicReveal>

          <div className="mt-16 space-y-12">
            {sections.map((section, idx) => (
              <PublicReveal key={section.title} delayMs={idx * 30}>
                <div>
                  <h2 className="font-display text-[1.8rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1f1a15]">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {section.content.map((paragraph) => (
                      <p key={paragraph} className="text-base leading-7 text-[#5f5549]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </PublicReveal>
            ))}
          </div>

          <PublicReveal delayMs={sections.length * 30}>
            <div className="mt-16 rounded-[2.4rem] border border-[#e5d8c7] bg-[#fbf7f1] p-8">
              <p className="text-sm leading-7 text-[#5f5549]">
                <strong className="text-[#1f1a15]">{isPortuguese ? 'Ultima atualizacao:' : 'Last updated:'}</strong> {isPortuguese ? 'Marco de 2026' : 'March 2026'}{' '}
                <br className="md:hidden" />
                <span className="hidden md:inline">•</span>{' '}
                <strong className="text-[#1f1a15]">{isPortuguese ? 'Versao:' : 'Version:'}</strong> 1.0
              </p>
            </div>
          </PublicReveal>
        </div>
      </section>
    </PublicLayout>
  )
}
