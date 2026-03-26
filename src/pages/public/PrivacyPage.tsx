import { ArrowLeft } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { PublicReveal } from '@/features/public/components/PublicReveal'
import { useSeoMeta } from '@/shared/lib'

export function PrivacyPage() {
  useSeoMeta({
    title: 'Política de Privacidade | Animalz Events',
    description: 'Saiba como a Animalz Events coleta, usa e protege seus dados pessoais.',
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
              Voltar
            </a>

            <h1 className="mt-8 font-display text-[clamp(3.2rem,6vw,5.2rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[#1f1a15]">
              Sua privacidade importa.
            </h1>

            <p className="mt-6 text-base leading-8 text-[#5f5549] md:text-lg">
              Na Animalz Events, protegemos seus dados com seriedade. Esta política explica como coletamos, usamos e mantemos seguras suas informações.
            </p>
          </PublicReveal>

          <div className="mt-16 space-y-12">
            {[
              {
                title: '1. Sobre Esta Política',
                content: [
                  'Esta Política de Privacidade descreve como a Animalz Events ("nós", "nosso" ou "Animalz") coleta, usa, armazena e protege suas informações pessoais quando você utiliza nossa plataforma.',
                ],
              },
              {
                title: '2. Informações que Coletamos',
                content: [
                  'Coletamos informações de duas formas principais:',
                  '• Informações fornecidas diretamente: nome, email, telefone, endereço e dados de pagamento quando você se cadastra, compra ingressos ou cria um evento.',
                  '• Informações coletadas automaticamente: dados de uso da plataforma, endereço IP, tipo de navegador e cookies para melhorar sua experiência.',
                ],
              },
              {
                title: '3. Como Usamos Seus Dados',
                content: [
                  'Usamos suas informações para:',
                  '• Processar transações e enviar confirmações de compra',
                  '• Melhorar e personalizar sua experiência na plataforma',
                  '• Enviar atualizações sobre seus eventos e ingressos',
                  '• Garantir segurança e prevenir fraude',
                  '• Cumprir obrigações legais',
                  '• Com seu consentimento, enviar promoções e atualizações sobre novos eventos',
                ],
              },
              {
                title: '4. Base Legal para Processamento',
                content: [
                  'Processamos seus dados com base em:',
                  '• Seu consentimento (para marketing)',
                  '• Execução de contrato (para realizar transações)',
                  '• Obrigações legais (para compliance)',
                  '• Interesses legítimos (para melhorar o serviço)',
                ],
              },
              {
                title: '5. Compartilhamento de Dados',
                content: [
                  'Compartilhamos suas informações apenas quando necessário:',
                  '• Com processadores de pagamento (Stripe, etc.) para processar pagamentos',
                  '• Com produtores de eventos quando você compra ingressos',
                  '• Com autoridades quando exigido por lei',
                  '• Nunca vendemos seus dados para terceiros',
                ],
              },
              {
                title: '6. Segurança de Dados',
                content: [
                  'Implementamos medidas técnicas e organizacionais para proteger seus dados:',
                  '• Criptografia SSL/TLS para dados em trânsito',
                  '• Criptografia de dados sensíveis em repouso',
                  '• Acesso restrito a dados pessoais',
                  '• Monitoramento contínuo de segurança',
                  'Porém, nenhum sistema é 100% seguro. Proteja sua senha e notifique-nos de acessos não autorizados imediatamente.',
                ],
              },
              {
                title: '7. Retenção de Dados',
                content: [
                  'Mantemos seus dados apenas pelo tempo necessário:',
                  '• Dados de conta: enquanto sua conta estiver ativa',
                  '• Dados de transações: 7 anos para conformidade fiscal',
                  '• Cookies: até 1 ano',
                  'Você pode solicitar exclusão de dados a qualquer momento (sujeito a obrigações legais).',
                ],
              },
              {
                title: '8. Seus Direitos (LGPD)',
                content: [
                  'Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:',
                  '• Acessar seus dados pessoais',
                  '• Corrigir informações imprecisas',
                  '• Deletar seus dados ("direito ao esquecimento")',
                  '• Portabilidade dos dados',
                  '• Revogar consentimento de marketing',
                  'Para exercer estes direitos, escreva para privacy@animalz.events',
                ],
              },
              {
                title: '9. Cookies',
                content: [
                  'Usamos cookies para:',
                  '• Manter sua sessão ativa',
                  '• Lembrar suas preferências',
                  '• Analisar como você usa a plataforma',
                  'Você pode desativar cookies no seu navegador, mas algumas funcionalidades podem ser afetadas.',
                ],
              },
              {
                title: '10. Transferências Internacionais',
                content: [
                  'Se você estiver fora do Brasil, seus dados podem ser transferidos para servidores em outros países. Implementamos salvaguardas apropriadas para protegê-los em conformidade com a lei.',
                ],
              },
              {
                title: '11. Dados de Menores',
                content: [
                  'Não coletamos dados de pessoas menores de 18 anos sem consentimento parental. Se descobrirmos coleta não autorizada, deletaremos os dados imediatamente.',
                ],
              },
              {
                title: '12. Contato e Reclamações',
                content: [
                  'Para dúvidas sobre privacidade:',
                  '• Email: privacy@animalz.events',
                  '• Página de contato: animalz.events/contact',
                  'Se não estiver satisfeito com nossa resposta, você pode registrar reclamação junto à Autoridade Nacional de Proteção de Dados (ANPD).',
                ],
              },
              {
                title: '13. Atualizações desta Política',
                content: [
                  'Esta política pode ser atualizada sem aviso prévio. Mudanças significativas serão notificadas por email ou na plataforma. Seu uso contínuo representa aceitação das mudanças.',
                ],
              },
            ].map((section, idx) => (
              <PublicReveal key={idx} delayMs={idx * 30}>
                <div>
                  <h2 className="font-display text-[1.8rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1f1a15]">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-3">
                    {section.content.map((paragraph, pidx) => (
                      <p key={pidx} className="text-base leading-7 text-[#5f5549]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </PublicReveal>
            ))}
          </div>

          <PublicReveal delayMs={13 * 30}>
            <div className="mt-16 rounded-[2.4rem] border border-[#e5d8c7] bg-[#fbf7f1] p-8">
              <p className="text-sm leading-7 text-[#5f5549]">
                <strong className="text-[#1f1a15]">Última atualização:</strong> Março de 2026{' '}
                <br className="md:hidden" />
                <span className="hidden md:inline">•</span>{' '}
                <strong className="text-[#1f1a15]">Versão:</strong> 1.0
              </p>
            </div>
          </PublicReveal>
        </div>
      </section>
    </PublicLayout>
  )
}
