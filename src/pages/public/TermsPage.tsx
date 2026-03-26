import { ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { PublicReveal } from '@/features/public/components/PublicReveal'
import { useSeoMeta } from '@/shared/lib'

export function TermsPage() {
  useSeoMeta({
    title: 'Termos de Uso | Animalz Events',
    description: 'Conheça os termos e condições de uso da plataforma Animalz Events.',
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
              Voltar
            </a>

            <h1 className="mt-8 font-display text-[clamp(3.2rem,6vw,5.2rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-text-primary">
              Termos de uso.
            </h1>

            <p className="mt-6 text-base leading-8 text-text-secondary md:text-lg">
              Ao usar a plataforma Animalz Events, você concorda com os seguintes termos. Leia com atenção.
            </p>
          </PublicReveal>

          <div className="mt-16 space-y-12">
            {[
              {
                title: '1. Aceitação dos Termos',
                content: [
                  'Ao acessar e usar a plataforma Animalz Events, você aceita estar vinculado por estes termos. Se não concordar com qualquer parte, não use o serviço.',
                ],
              },
              {
                title: '2. Licença de Uso',
                content: [
                  'Concedemos a você uma licença limitada, não exclusiva e revogável para acessar e usar a plataforma Animalz Events para fins pessoais ou comerciais legítimos.',
                  'Você não pode: (a) reproduzir, modificar ou criar trabalhos derivados do conteúdo; (b) usar a plataforma para atividades ilegais; (c) contornar medidas de segurança; (d) acessar dados sem autorização.',
                ],
              },
              {
                title: '3. Contas de Usuário',
                content: [
                  'Para acessar certas funcionalidades, você precisará criar uma conta fornecendo informações precisas e atualizadas.',
                  'Você é responsável por manter a confidencialidade de suas credenciais e por todas as atividades em sua conta. Notifique-nos imediatamente de qualquer acesso não autorizado.',
                ],
              },
              {
                title: '4. Transações e Pagamentos',
                content: [
                  'A Animalz Events facilita transações de ingressos entre compradores e produtores, mas não é responsável por bens ou serviços fornecidos após a compra.',
                  'Todos os pagamentos são processados de forma segura através de gateways certificados. Taxas de serviço e processamento serão claramente informadas na hora da compra.',
                ],
              },
              {
                title: '5. Propriedade Intelectual',
                content: [
                  'Todo o conteúdo da plataforma Animalz Events — incluindo textos, imagens, logos, designs — é nossa propriedade intelectual ou de nossos licenciadores.',
                  'Você não pode reproduzir, distribuir ou transmitir este conteúdo sem nossa permissão prévia por escrito.',
                ],
              },
              {
                title: '6. Isenção de Responsabilidade',
                content: [
                  'A plataforma é fornecida "como está", sem garantias explícitas ou implícitas de qualquer tipo.',
                  'Não garantimos que a plataforma será (a) ininterrupta, (b) segura, (c) isenta de erros ou (d) que quaisquer deficiências serão corrigidos.',
                ],
              },
              {
                title: '7. Limitação de Responsabilidade',
                content: [
                  'Em nenhuma circunstância a Animalz Events será responsável por danos indiretos, incidentais, especiais ou consequentes, incluindo lucros cessantes ou perda de dados.',
                  'Nossa responsabilidade total não excede o valor do último pagamento que você fez através da plataforma.',
                ],
              },
              {
                title: '8. Conduta do Usuário',
                content: [
                  'Você concorda em usar a plataforma apenas para fins legais e de forma que não viole direitos de terceiros ou nossas políticas.',
                  'Proibido: conteúdo ofensivo, atividades ilegais, fraude, acesso não autorizado ou qualquer prática abusiva.',
                ],
              },
              {
                title: '9. Privacidade',
                content: [
                  'Sua privacidade é importante. Consulte nossa Política de Privacidade para entender como coletamos, usamos e protegemos seus dados.',
                ],
              },
              {
                title: '10. Modificações dos Termos',
                content: [
                  'Podemos modificar estes termos a qualquer momento. Mudanças significativas serão notificadas e entrarão em vigor após a publicação.',
                  'Seu uso contínuo da plataforma constitui aceitação dos termos modificados.',
                ],
              },
              {
                title: '11. Lei Aplicável',
                content: [
                  'Estes termos são regidos pela Lei Brasileira. Qualquer disputa será resolvida nos tribunais competentes do Brasil.',
                ],
              },
              {
                title: '12. Contato',
                content: [
                  'Para dúvidas sobre estes termos, entre em contato conosco em support@animalz.events ou acesse nossa página de contato.',
                ],
              },
            ].map((section, idx) => (
              <PublicReveal key={idx} delayMs={idx * 30}>
                <div>
                  <h2 className="font-display text-[1.8rem] font-semibold leading-[1.1] tracking-[-0.02em] text-text-primary">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {section.content.map((paragraph, pidx) => (
                      <p key={pidx} className="text-base leading-7 text-text-secondary">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </PublicReveal>
            ))}
          </div>

          <PublicReveal delayMs={12 * 30}>
            <div className="mt-16 rounded-[2.4rem] border border-bg-border bg-bg-card p-8">
              <p className="text-sm leading-7 text-text-secondary">
                <strong className="text-text-primary">Última atualização:</strong> Março de 2026{' '}
                <br className="md:hidden" />
                <span className="hidden md:inline">•</span>{' '}
                <strong className="text-text-primary">Versão:</strong> 1.0
              </p>
            </div>
          </PublicReveal>
        </div>
      </section>
    </PublicLayout>
  )
}
