import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useAnimationPreset } from '@/shared/motion'

type EventHeroMediaType = 'image' | 'video'
type EventHeroTone = 'light' | 'dark'

interface CountdownState {
  days: string
  hours: string
  minutes: string
  seconds: string
}

export interface EventHeroProps {
  title: string
  subtitle: string
  eventDate: string | Date
  primaryActionLabel: string
  onPrimaryAction: () => void
  secondaryActionLabel: string
  onSecondaryAction: () => void
  backgroundMediaUrl?: string
  backgroundMediaType?: EventHeroMediaType
  contentTone?: EventHeroTone
  eyebrow?: string
  posterUrl?: string
}

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, '0')
}

function getCountdown(eventDate: string | Date): CountdownState {
  const target = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  const diff = Math.max(target.getTime() - Date.now(), 0)

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  }
}

export function EventHero({
  title,
  subtitle,
  eventDate,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  backgroundMediaUrl,
  backgroundMediaType = 'image',
  contentTone = 'light',
  eyebrow = 'Pulse Event',
  posterUrl,
}: EventHeroProps) {
  const [countdown, setCountdown] = useState(() => getCountdown(eventDate))
  const [parallaxOffset, setParallaxOffset] = useState(0)
  const heroAnimation = useAnimationPreset('fadeIn', { durationMs: 620 })
  const titleAnimation = useAnimationPreset('slideUp', { delayMs: 110, distance: 28, durationMs: 520 })
  const subtitleAnimation = useAnimationPreset('slideUp', { delayMs: 180, distance: 22, durationMs: 500 })
  const ctaAnimation = useAnimationPreset('scaleIn', { delayMs: 280, durationMs: 480 })

  useEffect(() => {
    setCountdown(getCountdown(eventDate))

    const intervalId = window.setInterval(() => {
      setCountdown(getCountdown(eventDate))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [eventDate])

  useEffect(() => {
    let frameId = 0

    function handleScroll() {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        setParallaxOffset(Math.min(window.scrollY * 0.28, 160))
        frameId = 0
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  const toneVariables = useMemo(
    () =>
      contentTone === 'dark'
        ? {
            '--event-hero-title': 'var(--pulse-color-text-primary)',
            '--event-hero-copy': 'color-mix(in srgb, var(--pulse-color-text-primary) 76%, var(--pulse-color-text-secondary))',
            '--event-hero-eyebrow': 'color-mix(in srgb, var(--pulse-color-text-primary) 72%, var(--pulse-color-text-secondary))',
            '--event-hero-card-bg': 'color-mix(in srgb, var(--pulse-color-background) 82%, transparent)',
            '--event-hero-card-border': 'color-mix(in srgb, var(--pulse-color-text-primary) 10%, var(--pulse-color-border))',
            '--event-hero-secondary-text': 'var(--pulse-color-primary)',
          }
        : {
            '--event-hero-title': 'var(--pulse-color-text-inverse)',
            '--event-hero-copy': 'color-mix(in srgb, var(--pulse-color-text-inverse) 72%, var(--pulse-color-text-secondary))',
            '--event-hero-eyebrow': 'color-mix(in srgb, var(--pulse-color-text-inverse) 78%, var(--pulse-color-text-secondary))',
            '--event-hero-card-bg': 'color-mix(in srgb, var(--pulse-color-background) 16%, transparent)',
            '--event-hero-card-border': 'color-mix(in srgb, var(--pulse-color-background) 24%, transparent)',
            '--event-hero-secondary-text': 'var(--pulse-color-text-inverse)',
          },
    [contentTone],
  )

  return (
    <>
      <style>{`
        .event-hero {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: clip;
          isolation: isolate;
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--pulse-color-primary) 8%, var(--pulse-color-background)) 0%, var(--pulse-color-background) 100%);
        }

        .event-hero__fallback,
        .event-hero__media-wrap,
        .event-hero__overlay,
        .event-hero__mist {
          position: absolute;
          inset: 0;
        }

        .event-hero__fallback {
          background:
            radial-gradient(circle at 20% 18%, color-mix(in srgb, var(--pulse-color-primary) 22%, transparent) 0%, transparent 36%),
            linear-gradient(180deg, color-mix(in srgb, var(--pulse-color-primary) 10%, var(--pulse-color-background)) 0%, var(--pulse-color-background) 100%);
        }

        .event-hero__media-wrap {
          transform: translate3d(0, calc(var(--event-hero-parallax, 0px) * 1px), 0) scale(1.06);
          transform-origin: center top;
          will-change: transform;
        }

        .event-hero__media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: saturate(1.04) contrast(1.02);
        }

        .event-hero__overlay {
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--pulse-color-text-primary) 18%, transparent) 0%, color-mix(in srgb, var(--pulse-color-text-primary) 42%, transparent) 100%),
            radial-gradient(circle at 24% 22%, color-mix(in srgb, var(--pulse-color-primary) 32%, transparent) 0%, transparent 38%);
        }

        .event-hero__mist {
          background:
            radial-gradient(circle at 18% 16%, color-mix(in srgb, var(--pulse-color-primary) 28%, transparent) 0%, transparent 28%),
            radial-gradient(circle at 75% 60%, color-mix(in srgb, var(--pulse-color-primary-light) 12%, transparent) 0%, transparent 24%);
          filter: blur(28px);
          opacity: 0.78;
        }

        .event-hero__inner {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .event-hero__container {
          width: min(100% - 3rem, 80rem);
          margin: 0 auto;
          padding: 7.5rem 0 4rem;
        }

        .event-hero__content {
          max-width: 40rem;
        }

        .event-hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.85rem;
          border-radius: var(--pulse-radius-full);
          border: 1px solid var(--event-hero-card-border);
          background: color-mix(in srgb, var(--event-hero-card-bg) 82%, transparent);
          backdrop-filter: blur(12px);
          color: var(--event-hero-eyebrow);
          font-family: var(--pulse-font-family);
          font-size: var(--pulse-font-size-caption);
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .event-hero__title {
          margin: 1.5rem 0 0;
          color: var(--event-hero-title);
          font-family: var(--pulse-font-family);
          font-size: clamp(3.2rem, 7vw, 6rem);
          font-weight: 800;
          line-height: 0.92;
          letter-spacing: -0.06em;
          text-wrap: balance;
        }

        .event-hero__subtitle {
          margin: 1.35rem 0 0;
          max-width: 37.5rem;
          color: var(--event-hero-copy);
          font-family: var(--pulse-font-family);
          font-size: clamp(1rem, 1.65vw, 1.125rem);
          line-height: 1.75;
          text-wrap: balance;
        }

        .event-hero__countdown {
          margin-top: 2rem;
          display: grid;
          width: min(100%, 40rem);
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .event-hero__countdown-card {
          padding: 1rem 0.9rem;
          border-radius: var(--pulse-radius-lg);
          border: 1px solid var(--event-hero-card-border);
          background: var(--event-hero-card-bg);
          backdrop-filter: blur(14px);
          box-shadow: var(--pulse-shadow-soft);
        }

        .event-hero__countdown-value {
          display: block;
          color: var(--event-hero-title);
          font-family: var(--pulse-font-family);
          font-size: clamp(1.55rem, 3vw, 2.5rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .event-hero__countdown-label {
          display: block;
          margin-top: 0.45rem;
          color: var(--event-hero-copy);
          font-family: var(--pulse-font-family);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .event-hero__actions {
          margin-top: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.9rem;
          align-items: center;
        }

        .event-hero__primary-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .event-hero__pulse {
          position: absolute;
          width: 10rem;
          height: 10rem;
          border-radius: var(--pulse-radius-full);
          background: radial-gradient(circle, color-mix(in srgb, var(--pulse-color-primary) 26%, transparent) 0%, color-mix(in srgb, var(--pulse-color-primary-light) 18%, transparent) 42%, transparent 74%);
          filter: blur(18px);
          opacity: 0.8;
          animation: event-hero-pulse 3s ease-in-out infinite;
          pointer-events: none;
        }

        .event-hero__button {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 3.25rem;
          padding: 0.95rem 1.45rem;
          border-radius: var(--pulse-radius-full);
          font-family: var(--pulse-font-family);
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background-color 180ms ease,
            border-color 180ms ease,
            color 180ms ease;
        }

        .event-hero__button--primary {
          border: 1px solid var(--pulse-color-primary);
          background: var(--pulse-color-primary);
          color: var(--pulse-color-text-inverse);
          box-shadow: var(--pulse-shadow-medium);
        }

        .event-hero__button--primary:hover {
          transform: translateY(-1px) scale(1.015);
          background: var(--pulse-color-primary-light);
          border-color: var(--pulse-color-primary-light);
          box-shadow: var(--pulse-shadow-strong);
        }

        .event-hero__button--outline {
          border: 1px solid color-mix(in srgb, var(--pulse-color-primary) 42%, var(--event-hero-card-border));
          background: color-mix(in srgb, var(--event-hero-card-bg) 76%, transparent);
          color: var(--event-hero-secondary-text);
          backdrop-filter: blur(12px);
        }

        .event-hero__button--outline:hover {
          transform: translateY(-1px);
          border-color: var(--pulse-color-primary);
          color: var(--pulse-color-primary);
          background: color-mix(in srgb, var(--pulse-color-background) 82%, transparent);
          box-shadow: var(--pulse-shadow-soft);
        }

        .event-hero__button:focus-visible {
          outline: 3px solid var(--pulse-focus-ring);
          outline-offset: 4px;
        }

        @keyframes event-hero-pulse {
          0% {
            opacity: 0.48;
            transform: scale(0.88);
          }

          50% {
            opacity: 0.92;
            transform: scale(1.04);
          }

          100% {
            opacity: 0.48;
            transform: scale(0.88);
          }
        }

        @media (max-width: 768px) {
          .event-hero__container {
            width: min(100% - 1.5rem, 80rem);
            padding: 6rem 0 3rem;
          }

          .event-hero__title {
            font-size: clamp(2.45rem, 13vw, 4rem);
            line-height: 0.98;
          }

          .event-hero__subtitle {
            max-width: 100%;
            font-size: 0.98rem;
            line-height: 1.68;
          }

          .event-hero__countdown {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
          }

          .event-hero__countdown-card {
            padding: 0.9rem 0.8rem;
            border-radius: var(--pulse-radius-md);
          }

          .event-hero__actions {
            flex-direction: column;
            align-items: stretch;
          }

          .event-hero__primary-wrap,
          .event-hero__button {
            width: 100%;
          }

          .event-hero__pulse {
            width: 8.5rem;
            height: 8.5rem;
          }
        }
      `}</style>

      <motion.section
        className="event-hero"
        style={{
          ...toneVariables,
          '--event-hero-parallax': String(parallaxOffset),
        } as CSSProperties}
        initial={heroAnimation.initial}
        animate={heroAnimation.animate}
        variants={heroAnimation.variants}
      >
        <div className="event-hero__fallback" />

        {backgroundMediaUrl ? (
          <div className="event-hero__media-wrap" aria-hidden="true">
            {backgroundMediaType === 'video' ? (
              <video
                className="event-hero__media"
                src={backgroundMediaUrl}
                poster={posterUrl}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img className="event-hero__media" src={backgroundMediaUrl} alt="" />
            )}
          </div>
        ) : null}

        <div className="event-hero__overlay" />
        <div className="event-hero__mist" />

        <div className="event-hero__inner">
          <div className="event-hero__container">
            <div className="event-hero__content">
              <motion.div
                className="event-hero__eyebrow"
                initial={subtitleAnimation.initial}
                animate={subtitleAnimation.animate}
                variants={subtitleAnimation.variants}
              >
                {eyebrow}
              </motion.div>

              <motion.h1
                className="event-hero__title"
                initial={titleAnimation.initial}
                animate={titleAnimation.animate}
                variants={titleAnimation.variants}
              >
                {title}
              </motion.h1>

              <motion.p
                className="event-hero__subtitle"
                initial={subtitleAnimation.initial}
                animate={subtitleAnimation.animate}
                variants={subtitleAnimation.variants}
              >
                {subtitle}
              </motion.p>

              <motion.div
                className="event-hero__countdown"
                initial={ctaAnimation.initial}
                animate={ctaAnimation.animate}
                variants={ctaAnimation.variants}
                aria-label="Contador regressivo"
              >
                <div className="event-hero__countdown-card">
                  <span className="event-hero__countdown-value">{countdown.days}</span>
                  <span className="event-hero__countdown-label">Dias</span>
                </div>
                <div className="event-hero__countdown-card">
                  <span className="event-hero__countdown-value">{countdown.hours}</span>
                  <span className="event-hero__countdown-label">Horas</span>
                </div>
                <div className="event-hero__countdown-card">
                  <span className="event-hero__countdown-value">{countdown.minutes}</span>
                  <span className="event-hero__countdown-label">Min</span>
                </div>
                <div className="event-hero__countdown-card">
                  <span className="event-hero__countdown-value">{countdown.seconds}</span>
                  <span className="event-hero__countdown-label">Seg</span>
                </div>
              </motion.div>

              <motion.div
                className="event-hero__actions"
                initial={ctaAnimation.initial}
                animate={ctaAnimation.animate}
                variants={ctaAnimation.variants}
              >
                <div className="event-hero__primary-wrap">
                  <span className="event-hero__pulse" />
                  <button
                    type="button"
                    className="event-hero__button event-hero__button--primary"
                    onClick={onPrimaryAction}
                  >
                    {primaryActionLabel}
                  </button>
                </div>

                <button
                  type="button"
                  className="event-hero__button event-hero__button--outline"
                  onClick={onSecondaryAction}
                >
                  {secondaryActionLabel}
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </>
  )
}

export type { EventHeroMediaType, EventHeroTone }
