import { Zap } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-[#0057E7] flex items-center justify-center">
        <Zap className="w-6 h-6 text-white" />
      </div>
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#0057E7] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#0A1AFF] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="text-sm text-[#9CA3AF] tracking-wide">Pulse</p>
    </div>
  )
}
