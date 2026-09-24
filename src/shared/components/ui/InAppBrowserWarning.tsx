import { useState } from 'react'
import { AlertTriangle, Copy, ExternalLink } from 'lucide-react'

/**
 * Navegador de dentro de aplicativo (WhatsApp, Instagram, leitor de QR) costuma
 * bloquear ou simplesmente nao entregar GPS e camera, e a pessoa fica achando
 * que o sistema esta quebrado. Aqui a gente avisa e oferece a saida.
 */

const PADROES: Array<{ teste: RegExp; nome: string }> = [
  { teste: /WhatsApp/i, nome: 'WhatsApp' },
  { teste: /Instagram/i, nome: 'Instagram' },
  { teste: /FBAN|FBAV|FB_IAB/i, nome: 'Facebook' },
  { teste: /Messenger/i, nome: 'Messenger' },
  { teste: /musical_ly|Bytedance|TikTok/i, nome: 'TikTok' },
  { teste: /Line\//i, nome: 'Line' },
  { teste: /Telegram/i, nome: 'Telegram' },
]

export function detectarNavegadorDeApp(): string | null {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent || ''

  for (const { teste, nome } of PADROES) {
    if (teste.test(ua)) return nome
  }

  // WebView generica do Android: "; wv)" no user agent
  if (/Android/i.test(ua) && /;\s*wv\)/i.test(ua)) return 'aplicativo'

  return null
}

function ehAndroid(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '')
}

export function InAppBrowserWarning({ acao = 'bater o ponto' }: { acao?: string }) {
  const [copiado, setCopiado] = useState(false)
  const app = detectarNavegadorDeApp()

  if (!app) return null

  const url = typeof window !== 'undefined' ? window.location.href : ''

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 3000)
    } catch {
      // navegador antigo sem clipboard: o link continua visivel abaixo
    }
  }

  function abrirNoChrome() {
    // intent:// entrega a pagina para o Chrome de verdade no Android
    const semEsquema = url.replace(/^https?:\/\//, '')
    window.location.href =
      `intent://${semEsquema}#Intent;scheme=https;package=com.android.chrome;end`
  }

  return (
    <div className="mb-5 rounded-2xl border border-amber-400/35 bg-amber-400/[0.09] p-4 text-left">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-amber-200">
            Abra no navegador do celular
          </p>
          <p className="mt-1.5 text-[13px] leading-6 text-white/78">
            Você está dentro do {app}. O navegador do {app} costuma bloquear a
            localização e a câmera, e aí não dá para {acao}.
          </p>

          {ehAndroid() ? (
            <button
              type="button"
              onClick={abrirNoChrome}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#06070a]"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Abrir no Chrome
            </button>
          ) : (
            <p className="mt-3 text-[13px] leading-6 text-white/78">
              Toque no botão <strong className="text-[#f5f0e8]">···</strong> no canto da tela
              e escolha <strong className="text-[#f5f0e8]">Abrir no Safari</strong>.
            </p>
          )}

          <button
            type="button"
            onClick={copiar}
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70"
          >
            <Copy className="h-3 w-3" /> {copiado ? 'Link copiado' : 'Copiar link'}
          </button>
        </div>
      </div>
    </div>
  )
}
