import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Heart, Megaphone, Loader2, Rss } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { attendeeService } from '@/core/attendee/attendee.service'
import { supabase } from '@/lib/supabase'
import { useRealtimeFeed } from '@/core/realtime/realtime.hooks'
import type { FeedPost } from '@/core/attendee/attendee.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

export default function FeedPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [composing, setComposing] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [lastPostAt, setLastPostAt] = useState<number | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadFeed = async () => {
    if (!context?.eventId) { setLoading(false); return }
    setLoadError(false)
    try {
      const data = await attendeeService.getFeed(context.eventId)
      setPosts(data)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFeed() }, [context?.eventId])

  // Realtime new posts, reload feed on new insert
  useRealtimeFeed(context?.eventId, (_post) => {
    if (context?.eventId) {
      attendeeService.getFeed(context.eventId).then(setPosts).catch(() => {})
    }
  })

  const toggleLike = async (post: FeedPost) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const isLiked = liked.has(post.id)
      setLiked((s) => {
        const ns = new Set(s)
        isLiked ? ns.delete(post.id) : ns.add(post.id)
        return ns
      })

      // Optimistically update count
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likesCount: p.likesCount + (isLiked ? -1 : 1) }
            : p
        )
      )

      // Persist like
      if (isLiked) {
        await supabase.from('feed_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
        await supabase.from('event_feed_posts').update({ likes_count: Math.max(0, post.likesCount - 1) }).eq('id', post.id)
      } else {
        await supabase.from('feed_likes').upsert({ post_id: post.id, user_id: user.id, event_id: context?.eventId })
        await supabase.from('event_feed_posts').update({ likes_count: post.likesCount + 1 }).eq('id', post.id)
      }
    } catch {
      // Revert optimistic update silently
    }
  }

  const handleComposerInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComposing(e.target.value)
    setPostError(null)
    // Auto-resize: reset height then set to scrollHeight, capped at 4 rows (~96px)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'
  }

  const handlePublish = async () => {
    const body = composing.trim()
    if (!body || posting) return

    const now = Date.now()
    if (lastPostAt !== null && now - lastPostAt < 30_000) {
      const remaining = Math.ceil((30_000 - (now - lastPostAt)) / 1000)
      setPostError(`Aguarde ${remaining} segundo${remaining !== 1 ? 's' : ''}`)
      return
    }

    if (!context?.eventId) return

    setPosting(true)
    setPostError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setPosting(false); return }

      const authorName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Eu'

      const optimisticPost: FeedPost = {
        id: `optimistic-${Date.now()}`,
        authorName,
        authorAvatar: (user.user_metadata?.avatar_url as string | undefined) ?? null,
        body,
        imageUrl: null,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      }

      setPosts((prev) => [optimisticPost, ...prev])
      setComposing('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      setLastPostAt(now)

      const { error } = await supabase.from('event_feed_posts').insert({
        event_id: context.eventId,
        author_id: user.id,
        body,
        likes_count: 0,
        created_at: new Date().toISOString(),
      })

      if (error) {
        setPostError('Erro ao publicar. Tente novamente.')
        setPosts((prev) => prev.filter((p) => p.id !== optimisticPost.id))
      }
    } catch {
      setPostError('Erro ao publicar. Tente novamente.')
    } finally {
      setPosting(false)
    }
  }

  const cooldownSeconds = (() => {
    if (lastPostAt === null) return 0
    const remaining = Math.ceil((30_000 - (Date.now() - lastPostAt)) / 1000)
    return remaining > 0 ? remaining : 0
  })()

  const fmtTime = (s: string) => {
    try {
      return new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return '-'
    }
  }

  const isOfficial = (post: FeedPost) =>
    post.authorName === 'Organizador' || post.authorName?.toLowerCase().includes('organiz')

  const initials = (name: string) => {
    if (!name) return '??'
    return name.split(' ').map((w) => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '??'
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/attendee')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Feed</h1>
      </div>

      {/* Composer */}
      <div className="px-4 mb-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={composing}
            onChange={handleComposerInput}
            placeholder="Compartilhe algo com o evento..."
            className="w-full bg-transparent text-white placeholder:text-slate-600 text-sm outline-none resize-none leading-relaxed"
            style={{ minHeight: '24px', maxHeight: '96px' }}
          />
          {postError && (
            <p className="text-red-400 text-xs">{postError}</p>
          )}
          <div className="flex justify-end">
            <button
              onClick={handlePublish}
              disabled={!composing.trim() || posting || cooldownSeconds > 0}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {posting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : cooldownSeconds > 0 ? (
                `Aguarde ${cooldownSeconds}s`
              ) : (
                'Publicar'
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center py-16 px-6 text-center">
          <p className="text-slate-400 text-sm">Erro ao carregar dados.</p>
          <button onClick={loadFeed} className="mt-3 text-blue-400 text-sm">Tentar novamente</button>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center px-6">
          <Rss size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">Nenhuma publicação ainda</p>
          <p className="text-slate-600 text-xs mt-1">As novidades do evento aparecerão aqui</p>
        </div>
      ) : (
        <div className="flex-1 px-4 space-y-3">
          {(posts ?? []).map((post) => {
            const official = isOfficial(post)
            const isLiked = liked.has(post.id)

            return (
              <div
                key={post.id}
                className={`rounded-2xl border p-4 ${official ? 'border-blue-500/20 bg-blue-500/5' : 'border-white/8 bg-white/4'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${official ? 'bg-blue-600/40 text-blue-300' : 'bg-slate-700 text-white'}`}>
                      {official ? '🎪' : initials(post.authorName)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">{post.authorName}</p>
                      {official && <Megaphone size={12} className="text-blue-400" />}
                    </div>
                    <p className="text-slate-500 text-xs">{fmtTime(post.createdAt)}</p>
                  </div>
                </div>

                <p className="text-slate-200 text-sm leading-relaxed mb-3">{post.body}</p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-full rounded-xl mb-3 object-cover max-h-48"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}

                <div className="flex gap-4">
                  <button onClick={() => toggleLike(post)} className="flex items-center gap-1.5 text-xs">
                    <Heart
                      size={14}
                      className={isLiked ? 'text-red-400' : 'text-slate-600'}
                      fill={isLiked ? '#F87171' : 'none'}
                    />
                    <span className={isLiked ? 'text-red-400' : 'text-slate-500'}>
                      {post.likesCount}
                    </span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
