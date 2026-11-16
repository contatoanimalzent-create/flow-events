// Travas automáticas do pré-cadastro. Não confirmam que o CPF é da pessoa (isso exige consulta
// paga à Receita); confirmam que os dados são possíveis e que não há duplicidade no campeonato.

export const soDigitos = (v: string) => v.replace(/\D/g, '')

export function cpfValido(valor: string): boolean {
  const c = soDigitos(valor)
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += Number(c[i]) * (10 - i)
  let dv = ((soma * 10) % 11) % 10
  if (dv !== Number(c[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += Number(c[i]) * (11 - i)
  dv = ((soma * 10) % 11) % 10
  return dv === Number(c[10])
}

export const formatarCpf = (v: string) => {
  const c = soDigitos(v)
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
}

// DDDs em uso no Brasil (Anatel).
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
])

export function telefoneProblema(valor: string): string | null {
  let d = soDigitos(valor)
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2)
  if (d.length !== 10 && d.length !== 11) return 'informe DDD e número'
  if (!DDDS.has(Number(d.slice(0, 2)))) return `DDD ${d.slice(0, 2)} não existe`
  if (d.length === 11 && d[2] !== '9') return 'celular deve começar com 9 depois do DDD'
  if (/^(\d)\1+$/.test(d.slice(2))) return 'número inválido'
  return null
}

const ERROS_COMUNS: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gmail.co': 'gmail.com',
  'gmail.com.br': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'hotamil.com': 'hotmail.com', 'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com',
  'yaho.com': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahoo.com.b': 'yahoo.com.br', 'icloud.co': 'icloud.com',
}

export function emailSugestao(email: string): string | null {
  const dominio = email.split('@')[1]?.toLowerCase() ?? ''
  return ERROS_COMUNS[dominio] ?? null
}

// Confere se o domínio do e-mail recebe mensagens (registro MX, ou A como reserva).
// Em falha de rede, não bloqueia: a trava é contra erro de digitação, não contra a internet.
const cacheDominio = new Map<string, boolean>()
export async function dominioRecebeEmail(email: string): Promise<boolean> {
  const dominio = email.split('@')[1]?.toLowerCase() ?? ''
  if (!dominio) return false
  if (cacheDominio.has(dominio)) return cacheDominio.get(dominio)!
  const consulta = async (tipo: string) => {
    const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(dominio)}&type=${tipo}`, {
      headers: { accept: 'application/dns-json' },
      signal: AbortSignal.timeout(2500),
    })
    const j = await r.json()
    return j.Status === 0 && Array.isArray(j.Answer) && j.Answer.length > 0
  }
  try {
    const ok = (await consulta('MX')) || (await consulta('A'))
    cacheDominio.set(dominio, ok)
    return ok
  } catch {
    return true
  }
}

export const normalizarNome = (v: string) =>
  v.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')
