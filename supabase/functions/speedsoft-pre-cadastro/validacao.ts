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

// E-mails descartáveis: caixa pública ou temporária, ninguém recebe o ingresso por eles.
const DESCARTAVEIS = new Set([
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.biz', 'guerrillamailblock.com', 'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
  '10minutemail.com', '10minutemail.net', '20minutemail.com', 'minuteinbox.com', 'yopmail.com', 'yopmail.fr',
  'yopmail.net', 'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net', 'tempmailo.com', 'tempail.com',
  'tmpmail.org', 'tmpmail.net', 'tempinbox.com', 'tempr.email', 'mytemp.email', 'throwawaymail.com', 'trashmail.com',
  'trashmail.net', 'trashmail.de', 'mailnesia.com', 'maildrop.cc', 'getnada.com', 'nada.email', 'dispostable.com',
  'mintemail.com', 'mohmal.com', 'emailondeck.com', 'fakeinbox.com', 'fakemail.net', 'emailfake.com', 'mailcatch.com',
  'spamgourmet.com', 'burnermail.io', 'inboxkitten.com', 'moakt.com', 'discard.email', 'mailpoof.com', 'spambox.us',
  'mailtemp.net', '1secmail.com', '1secmail.net', '1secmail.org', 'mail.tm', 'mail.gw', 'dropmail.me', 'emltmp.com',
  'harakirimail.com', 'mailforspam.com', 'trbvm.com', 'armyspy.com', 'cuvox.de', 'dayrep.com', 'einrot.com',
  'fleckens.hu', 'gustr.com', 'jourrapide.com', 'rhyta.com', 'superrito.com', 'teleworm.us', 'linshiyouxiang.net',
])

export function emailDescartavel(email: string): boolean {
  const dominio = email.split('@')[1]?.toLowerCase() ?? ''
  if (DESCARTAVEIS.has(dominio)) return true
  return [...DESCARTAVEIS].some((d) => dominio.endsWith(`.${d}`))
}

// Palavras que aparecem em teste e em teclado batido, nunca em nome de atleta.
const LIXO = new Set([
  'asd', 'asdf', 'asdfg', 'sdf', 'dfg', 'qwe', 'qwer', 'qwerty', 'zxc', 'zxcv', 'hjk', 'jkl', 'abc', 'abcd',
  'xpto', 'xxx', 'teste', 'testes', 'test', 'testando', 'fulano', 'ciclano', 'sicrano', 'beltrano', 'nome',
  'sobrenome', 'nada', 'aaa', 'lol', 'kkk', 'blabla',
])

function palavraSemSentido(p: string) {
  if (LIXO.has(p)) return true
  if (/(.)\1\1/.test(p)) return true
  if (p.length >= 3 && !/[aeiouy]/.test(p)) return true
  if (p.length >= 8 && new Set(p).size <= 3) return true
  const pares = new Map<string, number>()
  for (let i = 0; i < p.length - 1; i++) {
    const par = p.slice(i, i + 2)
    pares.set(par, (pares.get(par) ?? 0) + 1)
    if (pares.get(par)! >= 3) return true
  }
  return false
}

export function nomeProblema(nome: string): string | null {
  const palavras = normalizarNome(nome).replace(/[^a-z\s'-]/g, '').split(' ').filter(Boolean)
  if (palavras.filter((p) => p.length >= 2).length < 2) return 'informe nome e sobrenome'
  if (palavras.some(palavraSemSentido)) return 'o nome não parece real. Use o nome completo do documento'
  return null
}

// Idade no primeiro dia do campeonato (19/12/2026). A lei permite airsoft a partir dos 14 anos.
export const IDADE_MINIMA = 14
const PRIMEIRO_DIA = { ano: 2026, mes: 12, dia: 19 }

export function idadeNoEvento(nascimento: string): number {
  const [d, m, a] = nascimento.split('/').map(Number)
  let idade = PRIMEIRO_DIA.ano - a
  if (PRIMEIRO_DIA.mes < m || (PRIMEIRO_DIA.mes === m && PRIMEIRO_DIA.dia < d)) idade--
  return idade
}

export function enderecoProblema(endereco: string): string | null {
  const e = normalizarNome(endereco)
  const palavras = e.split(' ').filter(Boolean)
  if (e.length < 10 || palavras.length < 2) return 'informe o endereço completo, com rua ou quadra e cidade'
  if (palavras.some((p) => LIXO.has(p))) return 'o endereço não parece real'
  return null
}
