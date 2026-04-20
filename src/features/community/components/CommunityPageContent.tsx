import { useState } from 'react'
import {
  Bell, Heart, MessageCircle, MoreHorizontal, Plus,
  RefreshCw, Search, Send, Share2, Smile, Trash2, Users,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { cn } from '@/shared/lib'

type Tab = 'feed' | 'anuncios' | 'networking' | 'conexoes'

const MOCK_POSTS = [
  {
    id: '1', author: 'Ana Lima', role: 'Participante', avatar: 'AL', time: '3 min',
    content: 'Que show incrível! O primeiro set foi surreal 🔥 Quem mais está na Pista Principal?',
    likes: 24, comments: 8, post_type: 'text', visibility: 'public',
  },
  {
    id: '2', author: 'Pulse Events', role: 'Organizador', avatar: '⚡', time: '12 min',
    content: '🎤 PRÓXIMO SET começa em 20 minutos no Stage Principal. Preparem-se!',
    likes: 156, comments: 31, post_type: 'announcement', visibility: 'public',
  },
  {
    id: '3', author: 'Carlos Melo', role: 'Participante', avatar: 'CM', time: '28 min',
    content: 'Perdeu o crachá ou tem dúvida? Passem na Portaria Norte que a gente resolve!',
    likes: 7, comments: 2, post_type: 'text', visibility: 'public',
  },
]

const MOCK_ANNOUNCEMENTS = [
  { id: '1', title: 'Próximo set em 20 minutos', body: 'DJ Kairos sobe ao palco às 22h30. Não perca!', priority: 'high', time: '5 min' },
  { id: '2', title: 'Portaria C fechada temporariamente', body: 'Use as portarias A ou B. Previsão de reabertura: 23h00.', priority: 'normal', time: '18 min' },
  { id: '3', title: 'Food trucks abertos até meia-noite', body: 'Área de alimentação com 8 opções disponíveis.', priority: 'low', time: '1h' },
]

const MOCK_CONNECTIONS = [
  { id: '1', name: 'Fernanda Costa', role: 'Startup Founder', mutual: 3, status: 'pending' },
  { id: '2', name: 'Rafael Souza', role: 'Product Designer', mutual: 1, status: 'accepted' },
  { id: '3', name: 'Beatriz Nunes', role: 'Marketing Lead', mutual: 5, status: 'accepted' },
]

function PostCard({ post }: { post: typeof MOCK_POSTS[0] }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes)

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-blue shrink-0">
            {post.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">{post.author}</span>
              {post.post_type === 'announcement' && (
                <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-medium text-brand-blue">Oficial</span>
              )}
            </div>
            <div className="text-xs text-text-muted">{post.role} · {post.time} atrás</div>
          </div>
        </div>
        <button className="btn-ghost p-1.5 text-text-muted hover:text-text-primary">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>

      <div className="flex items-center gap-4 pt-1 border-t border-white/5">
        <button
          onClick={() => { setLiked((l) => !l); setLikes((n) => liked ? n - 1 : n + 1) }}
          className={cn('flex items-center gap-1.5 text-xs transition-colors', liked ? 'text-status-error' : 'text-text-muted hover:text-status-error')}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          <span>{likes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors">
          <Share2 className="h-4 w-4" />
          <span>Compartilhar</span>
        </button>
        <button className="ml-auto flex items-center gap-1.5 text-xs text-status-error hover:text-status-error/70 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
          <span>Remover</span>
        </button>
      </div>
    </div>
  )
}

export function CommunityPageContent() {
  const { organization } = useAuthStore()
  const [tab, setTab] = useState<Tab>('feed')
  const [newPost, setNewPost] = useState('')
  const [newAnnTitle, setNewAnnTitle] = useState('')
  const [newAnnBody, setNewAnnBody] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')

  if (!organization) return null

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Social layer</div>
          <h1 className="admin-title">
            Comunidade<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            Feed, posts, anúncios, networking e conexões do evento.
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Posts hoje', value: '47', color: 'text-brand-blue' },
          { label: 'Reações', value: '312', color: 'text-status-error' },
          { label: 'Comentários', value: '89', color: 'text-status-success' },
          { label: 'Conexões', value: '23', color: 'text-brand-purple' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">{s.label}</div>
            <div className={cn('mt-2 text-2xl font-bold font-mono', s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="surface-panel flex items-center gap-1 p-2">
        {([
          { key: 'feed', label: 'Feed', icon: MessageCircle },
          { key: 'anuncios', label: 'Anúncios', icon: Bell },
          { key: 'networking', label: 'Networking', icon: Users },
          { key: 'conexoes', label: 'Conexões', icon: Share2 },
        ] as { key: Tab; label: string; icon: React.ElementType }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all',
              tab === t.key ? 'bg-brand-blue text-white' : 'text-text-muted hover:text-text-primary hover:bg-white/5',
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {tab === 'feed' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {/* Compose */}
            <div className="card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-xs font-bold text-brand-blue shrink-0">O</div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="input flex-1 min-h-[80px] resize-none text-sm"
                  placeholder="Escreva uma atualização para o evento..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="btn-ghost p-1.5"><Smile className="h-4 w-4 text-text-muted" /></button>
                </div>
                <button disabled={!newPost.trim()} className="btn-primary flex items-center gap-2 text-xs disabled:opacity-40">
                  <Send className="h-3.5 w-3.5" /> Publicar
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
              <input className="input h-10 w-full pl-9 text-sm" placeholder="Buscar no feed..." />
            </div>

            {/* Posts */}
            {MOCK_POSTS.map((post) => <PostCard key={post.id} post={post} />)}
          </div>

          {/* Right panel: quick stats + moderation */}
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Moderação rápida</h3>
              <div className="space-y-2 text-xs text-text-muted">
                <div className="flex items-center justify-between">
                  <span>Posts aguardando</span><span className="text-status-warning font-mono">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reportados</span><span className="text-status-error font-mono">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Removidos hoje</span><span className="font-mono">1</span>
                </div>
              </div>
            </div>
            <div className="card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Top engajamento</h3>
              {MOCK_POSTS.sort((a, b) => b.likes - a.likes).slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-start gap-2">
                  <Heart className="h-3.5 w-3.5 text-status-error mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-primary truncate">{p.content.slice(0, 50)}...</div>
                    <div className="text-[11px] text-text-muted">{p.likes} curtidas</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Anúncios */}
      {tab === 'anuncios' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Novo anúncio oficial</h3>
              <div>
                <label className="input-label">Título</label>
                <input className="input mt-1.5 w-full" value={newAnnTitle} onChange={(e) => setNewAnnTitle(e.target.value)} placeholder="Ex: Próximo set em 20 minutos" />
              </div>
              <div>
                <label className="input-label">Mensagem</label>
                <textarea className="input mt-1.5 w-full min-h-[80px] resize-none" value={newAnnBody} onChange={(e) => setNewAnnBody(e.target.value)} placeholder="Corpo do anúncio..." />
              </div>
              <div>
                <label className="input-label">Prioridade</label>
                <div className="flex items-center gap-2 mt-1.5">
                  {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn('rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all border',
                        priority === p
                          ? p === 'urgent' ? 'bg-status-error/10 border-status-error/30 text-status-error'
                            : p === 'high' ? 'bg-status-warning/10 border-status-warning/30 text-status-warning'
                              : p === 'normal' ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                                : 'bg-white/5 border-white/10 text-text-secondary'
                          : 'border-white/5 text-text-muted hover:text-text-primary',
                      )}
                    >{p}</button>
                  ))}
                </div>
              </div>
              <button className="btn-primary flex items-center gap-2 text-xs">
                <Bell className="h-3.5 w-3.5" /> Publicar anúncio
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Anúncios recentes</div>
            {MOCK_ANNOUNCEMENTS.map((ann) => (
              <div key={ann.id} className={cn('card p-4 space-y-2 border-l-2',
                ann.priority === 'high' ? 'border-l-status-warning' :
                ann.priority === 'urgent' ? 'border-l-status-error' : 'border-l-brand-blue/30',
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">{ann.title}</span>
                  <span className="text-[11px] text-text-muted">{ann.time} atrás</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{ann.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Networking */}
      {tab === 'networking' && (
        <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
          <Users className="h-10 w-10 text-text-muted" />
          <div className="text-sm font-semibold text-text-secondary">Networking premium</div>
          <div className="text-xs text-text-muted max-w-sm">
            Participantes com badge premium podem solicitar conexões e agendar reuniões durante o evento. Ative o módulo de monetização para liberar.
          </div>
          <button className="btn-primary mt-2 text-xs flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" /> Ativar networking premium
          </button>
        </div>
      )}

      {/* Conexões */}
      {tab === 'conexoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">{MOCK_CONNECTIONS.length} conexões neste evento</div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Participante</th>
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Conexões em comum</th>
                  <th className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CONNECTIONS.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-xs font-bold text-brand-blue">
                          {c.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">{c.name}</div>
                          <div className="text-xs text-text-muted">{c.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-text-muted">{c.mutual} em comum</td>
                    <td className="px-5 py-4">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium',
                        c.status === 'accepted' ? 'bg-status-success/10 text-status-success' : 'bg-status-warning/10 text-status-warning',
                      )}>
                        {c.status === 'accepted' ? 'Conectado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
