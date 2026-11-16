// E-mails do Campeonato Nacional de Speedsoft · Capital Strike, no visual do capitalstrikespeedsoft.com:
// fundo quase preto, cantos retos, dourado #F9AE00, rótulos em mono e títulos largos em caixa alta.
// Fontes web só carregam em alguns clientes (Apple Mail, iOS); o resto cai no Arial Black / Arial.

const SITE = 'https://capitalstrikespeedsoft.com'
const IMG = `${SITE}/assets/email`
const WHATS = 'https://wa.me/5561992946515'

const C = {
  fundo: '#0a0b08',
  painel: '#11130e',
  linha: '#24261e',
  texto: '#ecebe4',
  suave: '#a9aa9f',
  apagado: '#6d6e64',
  ouro: '#F9AE00',
}
const TITULO = "'Archivo','Arial Black','Helvetica Neue',Arial,sans-serif"
const CORPO = "'Archivo',Arial,Helvetica,sans-serif"
const MONO = "'JetBrains Mono','Courier New',Courier,monospace"

export function esc(v = '') {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}
export const primeiroNome = (n: string) => n.trim().split(/\s+/)[0] || 'combatente'

const rotulo = (t: string, cor = C.ouro) =>
  `<div style="font-family:${MONO};font-size:11px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:${cor};">${t}</div>`

function hud(estado: string, cor: string) {
  return `<tr><td style="padding:0 32px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-bottom:1px solid ${C.linha};"><tr>
<td class="hs" style="padding:16px 0;font-family:${MONO};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.suave};white-space:nowrap;">
<span style="color:${cor};font-size:13px;">&#9679;</span>&nbsp; Round 1 &nbsp;/&nbsp; <span style="color:${cor};">${estado}</span></td>
<td align="right" class="hd" style="padding:16px 0;font-family:${MONO};font-size:11px;letter-spacing:3px;color:${C.apagado};white-space:nowrap;">19&#8211;20.12.2026</td>
</tr></table></td></tr>`
}

function linhaDado(rot: string, valor: string, cor = C.texto) {
  return `<tr>
<td style="padding:13px 18px;border-top:1px solid ${C.linha};font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.apagado};width:38%;">${rot}</td>
<td style="padding:13px 18px;border-top:1px solid ${C.linha};font-family:${TITULO};font-size:15px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:${cor};">${valor}</td>
</tr>`
}

function passos(itens: Array<[string, string]>) {
  return itens.map(([t, d], i) => `<tr>
<td valign="top" style="padding:0 14px 18px 0;width:34px;font-family:${MONO};font-size:15px;color:${C.ouro};">${String(i + 1).padStart(2, '0')}</td>
<td valign="top" style="padding:0 0 18px;font-family:${CORPO};font-size:15px;line-height:23px;color:${C.suave};"><strong style="color:${C.texto};">${t}</strong><br>${d}</td>
</tr>`).join('')
}

function botao(texto: string, href: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="background:${C.ouro};">
<a href="${href}" style="display:inline-block;padding:16px 28px;font-family:${TITULO};font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.fundo};text-decoration:none;">${texto}</a>
</td></tr></table>`
}

function moldura(preheader: string, miolo: string) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<title>Campeonato Nacional de Speedsoft</title>
<style>
  @media (max-width:620px){ .px{padding-left:20px!important;padding-right:20px!important} .h1{font-size:28px!important;line-height:32px!important} .hd{display:none!important} .hs{letter-spacing:1px!important;font-size:10px!important} }
</style></head>
<body style="margin:0;padding:0;background:${C.fundo};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.fundo};"><tr><td align="center" style="padding:24px 10px 40px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:${C.fundo};border:1px solid ${C.linha};">

<tr><td class="px" style="padding:22px 32px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
<td><img src="${IMG}/logo.png" width="112" alt="Capital Strike" style="display:block;width:112px;height:auto;border:0;"></td>
<td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.ouro};">Speedsoft</td>
</tr></table></td></tr>

<tr><td style="padding:0;"><img src="${IMG}/topo.jpg" width="600" alt="Arena do Campeonato Nacional de Speedsoft" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>
<tr><td style="height:3px;background:${C.ouro};font-size:0;line-height:3px;">&nbsp;</td></tr>

${miolo}

<tr><td class="px" style="padding:28px 32px 30px;border-top:1px solid ${C.linha};background:${C.painel};">
${rotulo('Organização do Campeonato de Speedsoft', C.suave)}
<div style="font-family:${CORPO};font-size:13px;line-height:21px;color:${C.apagado};margin-top:10px;">
Campeonato Nacional de Speedsoft · Capital Strike<br>19 e 20 de dezembro de 2026 · Brasília/DF<br>
<a href="${SITE}" style="color:${C.ouro};text-decoration:none;">capitalstrikespeedsoft.com</a> &nbsp;·&nbsp;
<a href="${WHATS}" style="color:${C.ouro};text-decoration:none;">WhatsApp (61) 99294-6515</a></div>
</td></tr>

</table></td></tr></table></body></html>`
}

export type DadosRecebido = { nome: string; modalidade: string; equipe: string | null; atletas: number }

export function emailRecebido({ nome, modalidade, equipe, atletas }: DadosRecebido) {
  const p = esc(primeiroNome(nome))
  const miolo = `
${hud('Pré-cadastro recebido', C.ouro)}
<tr><td class="px" style="padding:30px 32px 6px;">
<h1 class="h1" style="margin:0;font-family:${TITULO};font-size:34px;line-height:39px;font-weight:800;letter-spacing:-.3px;text-transform:uppercase;color:${C.texto};">${p}, você<br>entrou no radar.</h1>
<p style="margin:18px 0 0;font-family:${CORPO};font-size:16px;line-height:26px;color:${C.suave};">Recebemos o seu pré-cadastro para o <strong style="color:${C.texto};">Campeonato Nacional de Speedsoft Capital Strike</strong>. Agora a organização analisa os dados e confirma a sua vaga.</p>
</td></tr>

<tr><td class="px" style="padding:26px 32px 4px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.painel};border:1px solid ${C.linha};">
<tr><td colspan="2" style="padding:14px 18px;">${rotulo('Sua inscrição')}</td></tr>
${linhaDado('Modalidade', esc(modalidade))}
${equipe ? linhaDado('Team', esc(equipe)) : ''}
${linhaDado('Atletas', String(atletas))}
${linhaDado('Status', 'Em análise', C.ouro)}
</table></td></tr>

<tr><td class="px" style="padding:30px 32px 6px;">
${rotulo('Próximos passos')}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
${passos([
  ['Análise da organização', 'Conferimos os dados de cada atleta e entramos em contato se faltar algo.'],
  ['Aprovação com QR Code', 'Aprovada a inscrição, cada atleta recebe por e-mail o próprio QR Code.'],
  ['Credenciamento', 'O QR é apresentado na entrada da arena, em Brasília, nos dias 19 e 20 de dezembro.'],
])}
</table></td></tr>

<tr><td class="px" style="padding:6px 32px 34px;">
${botao('Ver o campeonato', SITE)}
<p style="margin:20px 0 0;font-family:${CORPO};font-size:13px;line-height:21px;color:${C.apagado};">Preencheu algo errado? Responda este e-mail dizendo o que precisa ser ajustado.</p>
</td></tr>`
  const text = `${primeiroNome(nome)}, recebemos o seu pré-cadastro para o Campeonato Nacional de Speedsoft Capital Strike.

Modalidade: ${modalidade}${equipe ? `\nTeam: ${equipe}` : ''}
Atletas: ${atletas}
Status: em análise

Próximos passos:
01 Análise da organização
02 Aprovação: cada atleta recebe o próprio QR Code por e-mail
03 Credenciamento em Brasília, 19 e 20 de dezembro de 2026

Preencheu algo errado? Responda este e-mail.
${SITE}`
  return {
    subject: `${primeiroNome(nome)}, recebemos seu pré-cadastro | Campeonato Nacional de Speedsoft`,
    html: moldura(`Pré-cadastro recebido · ${modalidade}. A organização analisa e confirma a sua vaga.`, miolo),
    text,
  }
}

export type DadosIngresso = { nome: string; modalidade: string; equipe: string | null; numero: string; qr: string }

export function emailIngresso({ nome, modalidade, equipe, numero, qr }: DadosIngresso) {
  const p = esc(primeiroNome(nome))
  const miolo = `
${hud('Inscrição aprovada', '#3ddc84')}
<tr><td class="px" style="padding:30px 32px 6px;">
<h1 class="h1" style="margin:0;font-family:${TITULO};font-size:34px;line-height:39px;font-weight:800;letter-spacing:-.3px;text-transform:uppercase;color:${C.texto};">${p}, você<br>está dentro.</h1>
<p style="margin:18px 0 0;font-family:${CORPO};font-size:16px;line-height:26px;color:${C.suave};">Sua inscrição no <strong style="color:${C.texto};">Campeonato Nacional de Speedsoft Capital Strike</strong> foi aprovada. Este é o seu ingresso.</p>
</td></tr>

<tr><td class="px" style="padding:26px 32px 4px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.painel};border:1px solid ${C.linha};border-top:3px solid ${C.ouro};">
<tr><td align="center" style="padding:26px 18px 10px;">
${rotulo(`${esc(modalidade)}${equipe ? ` · ${esc(equipe)}` : ''}`)}
<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:18px;"><tr><td style="background:#ffffff;padding:14px;">
<img src="${qr}" width="220" height="220" alt="QR Code ${esc(numero)}" style="display:block;width:220px;height:220px;border:0;"></td></tr></table>
<div style="margin-top:16px;font-family:${MONO};font-size:18px;letter-spacing:4px;color:${C.texto};">${esc(numero)}</div>
<div style="margin-top:6px;font-family:${CORPO};font-size:13px;color:${C.apagado};">${esc(nome)}</div>
</td></tr>
<tr><td style="padding:0 18px 4px;"><div style="border-top:1px dashed ${C.linha};font-size:0;line-height:0;">&nbsp;</div></td></tr>
<tr><td style="padding:12px 18px 18px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
<td style="font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.apagado};">Datas<br><span style="font-family:${TITULO};font-size:14px;font-weight:800;color:${C.texto};letter-spacing:.5px;">19 e 20.12.2026</span></td>
<td align="right" style="font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.apagado};">Local<br><span style="font-family:${TITULO};font-size:14px;font-weight:800;color:${C.texto};letter-spacing:.5px;">Brasília/DF</span></td>
</tr></table></td></tr>
</table></td></tr>

<tr><td class="px" style="padding:30px 32px 6px;">
${rotulo('No dia do campeonato')}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
${passos([
  ['O QR é pessoal', 'Cada atleta tem o próprio. Não encaminhe para outra pessoa.'],
  ['Credenciamento', 'Apresente o QR na entrada da arena, no celular ou impresso.'],
  ['Local e horários', 'A organização envia o endereço e a programação antes do evento.'],
])}
</table></td></tr>

<tr><td class="px" style="padding:6px 32px 34px;">${botao('Ver o campeonato', SITE)}</td></tr>`
  const text = `${nome}, sua inscrição no Campeonato Nacional de Speedsoft Capital Strike foi aprovada.

Modalidade: ${modalidade}${equipe ? ` · ${equipe}` : ''}
Ingresso: ${numero}
19 e 20 de dezembro de 2026 · Brasília/DF

Abra a versão completa deste e-mail para ver o QR Code. Ele é pessoal e será usado no credenciamento.
${SITE}`
  return {
    subject: `Inscrição aprovada · ${numero} | Campeonato Nacional de Speedsoft`,
    html: moldura(`Inscrição aprovada · ${numero}. Seu QR Code para o credenciamento está aqui.`, miolo),
    text,
  }
}
