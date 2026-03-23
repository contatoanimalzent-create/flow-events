'use client'

import { useState, useEffect } from 'react'
import { Menu, Bell, Search, LogOut, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import type { NavSection } from './AppShell'

const sectionTitles: Record<NavSection, string> = {
  dashboard:     'Dashboard',
  events:        'Eventos',
  tickets:       'Ingressos & Lotes',
  sales:         'Vendas',
  checkin:       'Check-in Operacional',
  staff:         'Staff & Equipe',
  suppliers:     'Fornecedores',
  products:      'Produtos & PDV',
  inventory:     'Estoque & Insumos',
  communication: 'Comunicação',
  financial:     'Financeiro',
  growth:        'Growth Services',
  help:          'Ajuda & Treinamento',
  settings:      'Configurações',
}

interface TopbarProps {
  onMenuToggle: () => void
  activeSection: NavSection
}

export function Topbar({ onMenuToggle, activeSection }: TopbarProps) {
  const { signOut } = useAuthStore()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Atalho de teclado ⌘K para abrir busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowNotifications(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Buscando:', searchQuery)
      // Aqui você pode adicionar a lógica de busca real
      setShowSearch(false)
    }
  }

  return (
    <>
      <header className="h-14 bg-bg-secondary border-b border-bg-border flex items-center px-4 gap-4 shrink-0">
        <button onClick={onMenuToggle} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-all">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-text-primary">{sectionTitles[activeSection]}</h1>
        <div className="flex-1" />
        <button 
          onClick={() => setShowSearch(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-bg-border rounded-lg text-sm text-text-muted hover:border-brand-acid/30 transition-all"
        >
          <Search className="w-4 h-4" /><span>Buscar...</span>
          <span className="text-xs bg-bg-border px-1.5 py-0.5 rounded">⌘K</span>
        </button>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-status-error rounded-full" />
        </button>
        <button onClick={signOut} className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-all" title="Sair">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Modal de Busca */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-bg-secondary border border-bg-border rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-bg-border">
              <Search className="w-5 h-5 text-text-muted" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                type="text"
                placeholder="Buscar eventos, ingressos, clientes..."
                className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-muted"
              />
              <button 
                onClick={() => setShowSearch(false)}
                className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-card"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 text-center text-text-muted">
              {searchQuery ? 'Procurando...' : 'Digite para buscar'}
            </div>
          </div>
        </div>
      )}

      {/* Painel de Notificações */}
      {showNotifications && (
        <div className="absolute top-14 right-4 z-40 w-80 bg-bg-secondary border border-bg-border rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-bg-border">
            <h3 className="font-semibold text-text-primary">Notificações</h3>
            <button 
              onClick={() => setShowNotifications(false)}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            <div className="text-center text-text-muted text-sm">
              Nenhuma notificação no momento
            </div>
          </div>
        </div>
      )}
    </>
  )
}