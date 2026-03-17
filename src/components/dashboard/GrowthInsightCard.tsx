import { Zap, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/index'

interface Insight {
  id: string
  title: string
  description: string
  cta_text?: string
  cta_type?: string
  priority: number
}

export function GrowthInsightCard({ insight }: { insight: Insight }) {
  const dismiss = async () => {
    await supabase
      .from('growth_insights')
      .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', insight.id)
  }

  return (
    <Card className="relative group">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary transition-all"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-brand-purple" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium text-text-primary mb-1 pr-4">{insight.title}</h4>
          <p className="text-xs text-text-secondary leading-relaxed">{insight.description}</p>
          {insight.cta_text && (
            <button className="mt-3 text-xs font-medium text-brand-teal hover:underline">
              {insight.cta_text} →
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
