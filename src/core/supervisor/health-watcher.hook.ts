import { useEffect, useRef } from 'react'
import { supervisorService } from './supervisor.service'
import { useNotifications } from '@/core/notifications/notifications.store'

const POLL_INTERVAL = 120_000 // 2 minutes

export function useHealthWatcher(eventId: string | undefined) {
  const lastScore = useRef<number | null>(null)
  const add = useNotifications((s) => s.add)

  useEffect(() => {
    if (!eventId) return

    const check = async () => {
      try {
        const health = await supervisorService.getHealthScore(eventId)
        const prev = lastScore.current
        const curr = health.score

        if (prev !== null && curr < prev) {
          if (curr < 60 && prev >= 60) {
            add({
              type: 'critical',
              title: '⚠️ Alerta crítico',
              message: `Health Score caiu para ${curr}/100 (Nota ${health.grade}). Ação imediata necessária.`,
            })
          } else if (curr < 80 && prev >= 80) {
            add({
              type: 'warning',
              title: '⚡ Atenção',
              message: `Health Score em ${curr}/100. Verifique a equipe e ocorrências.`,
            })
          }
        }

        lastScore.current = curr
      } catch {
        // silent fail
      }
    }

    check() // immediate
    const timer = setInterval(check, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [eventId])
}
