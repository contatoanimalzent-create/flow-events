import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: ptBR })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function formatDaysUntil(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Encerrado'
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  return `Em ${diff} dias`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const eventStatusLabels: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Rascunho',   color: 'muted'   },
  review:    { label: 'Em revisão', color: 'warning' },
  published: { label: 'Publicado',  color: 'success' },
  ongoing:   { label: 'Em andamento', color: 'teal'  },
  finished:  { label: 'Encerrado',  color: 'muted'   },
  archived:  { label: 'Arquivado',  color: 'muted'   },
  cancelled: { label: 'Cancelado',  color: 'error'   },
}

export const orderStatusLabels: Record<string, { label: string; color: string }> = {
  pending:            { label: 'Pendente',   color: 'warning' },
  processing:         { label: 'Processando', color: 'info'  },
  paid:               { label: 'Pago',       color: 'success' },
  failed:             { label: 'Falhou',     color: 'error'   },
  cancelled:          { label: 'Cancelado',  color: 'muted'   },
  refunded:           { label: 'Reembolsado', color: 'purple' },
  partially_refunded: { label: 'Reemb. parcial', color: 'warning' },
  chargeback:         { label: 'Chargeback', color: 'error'   },
}

export const ticketStatusLabels: Record<string, { label: string; color: string }> = {
  pending:     { label: 'Pendente',    color: 'warning' },
  confirmed:   { label: 'Confirmado',  color: 'success' },
  cancelled:   { label: 'Cancelado',   color: 'muted'   },
  refunded:    { label: 'Reembolsado', color: 'purple'  },
  used:        { label: 'Utilizado',   color: 'info'    },
  transferred: { label: 'Transferido', color: 'teal'    },
  expired:     { label: 'Expirado',    color: 'error'   },
}
