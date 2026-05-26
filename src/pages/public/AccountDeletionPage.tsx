import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, Mail, Shield, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useAuthStore } from '@/features/auth'
import { useSeoMeta } from '@/shared/lib'

type Stage = 'form' | 'confirming' | 'success' | 'error'

export function AccountDeletionPage() {
  const { isPortuguese } = usePublicLocale()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  const [stage, setStage] = useState<Stage>('form')
  const [reason, setReason] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const requiredWord = isPortuguese ? 'EXCLUIR' : 'DELETE'
  const isConfirmed = confirmText.trim().toUpperCase() === requiredWord

  useSeoMeta({
    title: isPortuguese ? 'Excluir conta | Pulse' : 'Delete account | Pulse',
    description: isPortuguese
      ? 'Solicite a exclusao permanente da sua conta Pulse e de todos os seus dados pessoais.'
      : 'Request permanent deletion of your Pulse account and all your personal data.',
  })

  async function handleDelete() {
    if (!user) {
      setStage('error')
      setErrorMessage(isPortuguese ? 'Voce precisa estar logado para excluir sua conta.' : 'You must be logged in to delete your account.')
      return
    }
    setStage('confirming')
    setErrorMessage('')
    try {
      const { error } = await supabase.functions.invoke('account-deletion-request', {
        body: {
          user_id: user.id,
          email: user.email,
          reason: reason.trim() || null,
        },
      })
      if (error) throw error
      setStage('success')
      setTimeout(() => {
        void supabase.auth.signOut().then(() => {
          window.location.href = '/'
        })
      }, 5000)
    } catch (err) {
      console.error('[delete-account]', err)
      setStage('error')
      setErrorMessage(
        isPortuguese
          ? 'Nao foi possivel processar a exclusao agora. Tente novamente em alguns minutos ou envie email para contatopulse@animalzgroup.com.'
          : 'Could not process deletion right now. Try again in a few minutes or email contatopulse@animalzgroup.com.',
      )
    }
  }

  return (
    <PublicLayout showFooter>
      <section className="min-h-screen bg-[var(--pulse-color-surface,#0a0a0a)] px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <a href="/me" className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            ← {isPortuguese ? 'Voltar para minha conta' : 'Back to my account'}
          </a>

          <header className="mb-10">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {isPortuguese ? 'Excluir minha conta' : 'Delete my account'}
            </h1>
            <p className="mt-4 text-base leading-7 text-white/60">
              {isPortuguese
                ? 'Esta acao e permanente e irreversivel. Sua conta, ingressos, eventos e dados pessoais serao apagados.'
                : 'This action is permanent and irreversible. Your account, tickets, events and personal data will be erased.'}
            </p>
          </header>

          {stage === 'success' && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
              <h2 className="text-2xl font-semibold text-white">
                {isPortuguese ? 'Solicitacao recebida' : 'Request received'}
              </h2>
              <p className="mt-3 text-sm text-white/70">
                {isPortuguese
                  ? 'Sua exclusao sera processada em ate 30 dias. Voce recebera um email de confirmacao final.'
                  : 'Your deletion will be processed within 30 days. You will receive a final confirmation email.'}
              </p>
              <p className="mt-6 text-xs text-white/40">
                {isPortuguese ? 'Voce sera deslogado em instantes.' : 'You will be signed out shortly.'}
              </p>
            </div>
          )}

          {stage === 'error' && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">
              <AlertTriangle className="mb-2 h-5 w-5" />
              {errorMessage}
            </div>
          )}

          {(stage === 'form' || stage === 'error' || stage === 'confirming') && (
            <>
              <section className="mb-8 space-y-6 rounded-3xl border border-white/8 bg-white/[0.03] p-8">
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 shrink-0 text-white/40" />
                  <div className="space-y-2 text-sm text-white/70">
                    <p className="font-medium text-white">
                      {isPortuguese ? 'O que sera apagado:' : 'What will be deleted:'}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-white/60">
                      <li>{isPortuguese ? 'Seu perfil, nome, email e telefone' : 'Your profile, name, email and phone'}</li>
                      <li>{isPortuguese ? 'Eventos criados como produtor (se nao tiverem vendas)' : 'Events created as producer (if no sales exist)'}</li>
                      <li>{isPortuguese ? 'Ingressos comprados e QR codes' : 'Purchased tickets and QR codes'}</li>
                      <li>{isPortuguese ? 'Mensagens, comentarios e preferencias' : 'Messages, comments and preferences'}</li>
                      <li>{isPortuguese ? 'Historico de localizacao (se voce foi staff)' : 'Location history (if you were staff)'}</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-white/5 pt-6">
                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-400" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-white">
                      {isPortuguese ? 'O que sera mantido (obrigacao legal):' : 'What will be kept (legal obligation):'}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-white/60">
                      <li>{isPortuguese ? 'Registros financeiros (notas fiscais, repasses) por 5 anos' : 'Financial records (invoices) for 5 years'}</li>
                      <li>{isPortuguese ? 'Dados anonimizados de uso para estatisticas agregadas' : 'Anonymized usage data for aggregate statistics'}</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                {user && (
                  <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm">
                    <div className="text-white/40">{isPortuguese ? 'Conta a ser excluida:' : 'Account to be deleted:'}</div>
                    <div className="mt-1 font-medium text-white">{profile?.first_name ? `${profile.first_name} ${profile.last_name ?? ''}` : user.email}</div>
                    <div className="text-white/50">{user.email}</div>
                  </div>
                )}

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-white">
                    {isPortuguese ? 'Motivo (opcional)' : 'Reason (optional)'}
                  </div>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder={isPortuguese ? 'Conte-nos por que esta saindo... nos ajuda a melhorar' : 'Tell us why you are leaving... it helps us improve'}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-medium text-white">
                    {isPortuguese ? (
                      <>
                        Digite <span className="text-red-400">{requiredWord}</span> para confirmar
                      </>
                    ) : (
                      <>
                        Type <span className="text-red-400">{requiredWord}</span> to confirm
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={requiredWord}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-red-500/50"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={!isConfirmed || stage === 'confirming'}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
                >
                  {stage === 'confirming' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isPortuguese ? 'Processando...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      {isPortuguese ? 'Excluir minha conta permanentemente' : 'Delete my account permanently'}
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-white/40">
                  {isPortuguese ? 'Duvidas? Envie email para' : 'Questions? Email'}{' '}
                  <a href="mailto:contatopulse@animalzgroup.com" className="inline-flex items-center gap-1 text-white/60 underline hover:text-white">
                    <Mail className="h-3 w-3" />
                    contatopulse@animalzgroup.com
                  </a>
                </p>
              </section>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}

export default AccountDeletionPage
