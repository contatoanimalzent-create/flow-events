import { useState, useEffect, useCallback } from 'react'
import {
  Bell, Heart, MessageCircle, MoreHorizontal, Plus,
  RefreshCw, Search, Send, Share2, Smile, Trash2, Users,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/shared/lib'

type Tab = 'feed' | 'anuncios' | 'networking' | 'conexoes'

interface FeedPost {
  id: string
  author: string
  avatar: string
  time: string
  content: string
  likes: number
  comments: number
  post_type: 'text' | 'announcement'
  image_url: string | null
}

interface Announcement {
  id: string
  title: string
  body: string
  priority: string
  time: string
}

interface EventOption {
  id: string
  name: string
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d`
}

function PostCard({ post }: { post: FeedPost }) {
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
            <div className="text-xs text-text-muted">{post.time} atrás</div>
          </div>
        </div>
        <button className="btn-ghost p-1.5 text-text-muted hover:text-text-primary">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>

      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full rounded-lg object-cover max-h-72" />
      )}

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

  // ── Real data state ──────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventOption[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [attendeesCount, setAttendeesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [feedEmpty, setFeedEmpty] = useState(false)

  // ── Fetch events for this org ────────────────────────────────────────────
  useEffect(() => {
    if (!organization) return
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase
          .from('events')
          .select('id, name')
          .eq('organization_id', organization.id)
          .order('starts_at', { ascending: false })
          .limit(50)
        if (!cancelled && data && data.length > 0) {
          setEvents(data)
          setSelectedEventId((prev) => prev ?? data[0].id)
        }
      } catch {
        // table may not exist
      }
    })()
    return () => { cancelled = true }
  }, [organization])

  // ── Fetch community data when event changes ─────────────────────────────
  const fetchData = useCallback(async () => {
    if (!selectedEventId || !organization) return
    setLoading(true)

    // Fetch posts
    try {
      const { data, error } = await supabase
        .from('event_feed_posts')
        .select('id, body, image_url, created_at, likes_count, author_name')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        setFeedEmpty(true)
        setPosts([])
      } else if (data) {
        setFeedEmpty(data.length === 0)
        setPosts(
          (data as any[]).map((p) => ({
            id: p.id,
            author: p.author_name ?? 'Participante',
            avatar: (p.author_name ?? 'P').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
            time: formatRelativeTime(p.created_at),
            content: p.body ?? '',
            likes: p.likes_count ?? 0,
            comments: 0,
            post_type: 'text' as const,
            image_url: p.image_url ?? null,
          })),
        )
      }
    } catch {
      setFeedEmpty(true)
      setPosts([])
    }

    // Fetch announcements from staff_instructions with high/critical priority
    try {
      const { data } = await supabase
        .from('staff_instructions')
        .select('id, title, body, priority, created_at')
        .eq('event_id', selectedEventId)
        .in('priority', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setAnnouncements(
          (data as any[]).map((a) => ({
            id: a.id,
            title: a.title ?? '',
            body: a.body ?? '',
            priority: a.priority ?? 'normal',
            time: formatRelativeTime(a.created_at),
          })),
        )
      } else {
        setAnnouncements([])
      }
    } catch {
      setAnnouncements([])
    }

    // Fetch attendees count from digital_tickets
    try {
      const { count } = await supabase
        .from('digital_tickets')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', selectedEventId)
        .in('status', ['confirmed', 'used'])

      setAttendeesCount(count ?? 0)
    } catch {
      setAttendeesCount(0)
    }

    setLoading(false)
  }, [selectedEventId, organization])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
        <div className="flex items-center gap-2">
          {events.length > 1 && (
            <select
              className="input text-xs h-9 pr-8"
              value={selectedEventId ?? ''}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          )}
          <button onClick={() => fetchData()} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Posts', value: String(posts.length), color: 'text-brand-blue' },
          { label: 'Reações', value: String(posts.reduce((s, p) => s + p.likes, 0)), color: 'text-status-error' },
          { label: 'Anúncios', value: String(announcements.length), color: 'text-status-success' },
          { label: 'Participantes', value: String(attendeesCount), color: 'text-brand-purple' },
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      )}

      {/* Feed */}
      {!loading && tab === 'feed' && (
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

            {/* Posts or empty state */}
            {feedEmpty && posts.length === 0 ? (
              <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
                <MessageCircle className="h-10 w-10 text-text-muted" />
                <div className="text-sm font-semibold text-text-secondary">Comunidade será ativada em breve</div>
                <div className="text-xs text-text-muted max-w-sm">
                  Nenhum post encontrado para este evento. Os posts aparecerão aqui quando participantes começarem a interagir.
                </div>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>

          {/* Right panel: quick stats + moderation */}
          <div className="space-y-4">
            <div className="card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Moderação rápida</h3>
              <div className="space-y-2 text-xs text-text-muted">
                <div className="flex items-center justify-between">
                  <span>Posts aguardando</span><span className="text-status-warning font-mono">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reportados</span><span className="text-status-error font-mono">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total no feed</span><span className="font-mono">{posts.length}</span>
                </div>
              </div>
            </div>
            <div className="card p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Top engajamento</h3>
              {posts.length === 0 ? (
                <div className="text-xs text-text-muted">Nenhum post ainda.</div>
              ) : (
                [...posts].sort((a, b) => b.likes - a.likes).slice(0, 3).map((p) => (
                  <div key={p.id} className="flex items-start gap-2">
                    <Heart className="h-3.5 w-3.5 text-status-error mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-text-primary truncate">{p.content.slice(0, 50)}...</div>
                      <div className="text-[11px] text-text-muted">{p.likes} curtidas</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Anúncios */}
      {!loading && tab === 'anuncios' && (
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
            {announcements.length === 0 ? (
              <div className="card p-8 text-center">
                <div className="text-xs text-text-muted">Nenhum anúncio de alta prioridade.</div>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className={cn('card p-4 space-y-2 border-l-2',
                  ann.priority === 'high' ? 'border-l-status-warning' :
                  ann.priority === 'critical' ? 'border-l-status-error' : 'border-l-brand-blue/30',
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary">{ann.title}</span>
                    <span className="text-[11px] text-text-muted">{ann.time} atrás</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{ann.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Networking */}
      {!loading && tab === 'networking' && (
        <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
          <Users className="h-10 w-10 text-text-muted" />
          <div className="text-sm font-semibold text-text-secondary">Networking premium</div>
          <div className="text-xs text-text-muted max-w-sm">
            {attendeesCount > 0
              ? `${attendeesCount} participantes confirmados neste evento. Ative o módulo de networking premium para liberar conexões.`
              : 'Participantes com badge premium podem solicitar conexões e agendar reuniões durante o evento. Ative o módulo de monetização para liberar.'}
          </div>
          <button className="btn-primary mt-2 text-xs flex items-center gap-2">
            <Plus className="h-3.5 w-3.5" /> Ativar networking premium
          </button>
        </div>
      )}

      {/* Conexões */}
      {!loading && tab === 'conexoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">{attendeesCount} participantes neste evento</div>
          </div>
          {attendeesCount === 0 ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center gap-3">
              <Share2 className="h-10 w-10 text-text-muted" />
              <div className="text-sm font-semibold text-text-secondary">Nenhuma conexão ainda</div>
              <div className="text-xs text-text-muted max-w-sm">
                Conexões aparecerão aqui quando participantes começarem a interagir no evento.
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="text-xs text-text-muted">
                O módulo de conexões será exibido quando ativado. Atualmente há {attendeesCount} participantes confirmados.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
