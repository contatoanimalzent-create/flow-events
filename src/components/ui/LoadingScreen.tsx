import { Ticket } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-gradient-teal flex items-center justify-center animate-pulse-slow">
        <Ticket className="w-6 h-6 text-bg-primary" />
      </div>
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
