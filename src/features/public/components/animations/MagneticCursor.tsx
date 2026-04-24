import gsap from 'gsap'
import { useEffect, useRef } from 'react'

export function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on pointer:fine devices (desktop with mouse)
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    const text = textRef.current
    if (!dot || !ring || !text) return

    // Hide native cursor
    document.body.style.cursor = 'none'

    let mouseX = -100
    let mouseY = -100

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Dot follows instantly
      gsap.set(dot, { x: mouseX, y: mouseY })

      const target = e.target as Element

      const magneticEl = target.closest('[data-cursor="magnetic"]')
      const textEl = target.closest('[data-cursor="text"]')

      if (magneticEl) {
        const cursorText = magneticEl.getAttribute('data-cursor-text') ?? ''
        text.textContent = cursorText

        gsap.to(ring, {
          x: mouseX,
          y: mouseY,
          width: 80,
          height: 80,
          borderColor: '#C9A84C',
          backgroundColor: 'rgba(201,168,76,0.08)',
          duration: 0.4,
          ease: 'power2.out',
        })
        gsap.to(text, { opacity: cursorText ? 1 : 0, duration: 0.2 })
      } else if (textEl) {
        const cursorText = textEl.getAttribute('data-cursor-text') ?? ''
        text.textContent = cursorText

        gsap.to(ring, {
          x: mouseX,
          y: mouseY,
          width: 72,
          height: 72,
          borderColor: 'rgba(255,255,255,0.7)',
          backgroundColor: 'rgba(255,255,255,0.06)',
          duration: 0.4,
          ease: 'power2.out',
        })
        gsap.to(text, { opacity: cursorText ? 1 : 0, duration: 0.2 })
      } else {
        text.textContent = ''

        gsap.to(ring, {
          x: mouseX,
          y: mouseY,
          width: 40,
          height: 40,
          borderColor: 'rgba(255,255,255,0.4)',
          backgroundColor: 'transparent',
          duration: 0.8,
          ease: 'power2.out',
        })
        gsap.to(text, { opacity: 0, duration: 0.15 })
      }
    }

    const onMouseEnter = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.3 })
    }

    const onMouseLeave = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 })
    }

    const onMouseDown = () => {
      gsap.to(dot, { scale: 0.7, duration: 0.1 })
      gsap.to(ring, { scale: 0.85, duration: 0.15 })
    }

    const onMouseUp = () => {
      gsap.to(dot, { scale: 1, duration: 0.2, ease: 'elastic.out(1.2,0.5)' })
      gsap.to(ring, { scale: 1, duration: 0.2, ease: 'elastic.out(1.2,0.5)' })
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseenter', onMouseEnter)
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <>
      {/* Small dot, instant follow */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          willChange: 'transform',
        }}
      />

      {/* Large ring, smooth lag follow via GSAP */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.4)',
          willChange: 'transform, width, height',
          opacity: 0,
        }}
      >
        <span
          ref={textRef}
          className="pointer-events-none select-none text-[9px] font-semibold uppercase tracking-[0.15em] text-white"
          style={{ opacity: 0 }}
        />
      </div>
    </>
  )
}
