import { useEffect, useState } from 'react'

interface PremiumEventHeroProps {
  title: string
  subtitle: string
  eventDate: string | Date
  callToActionLabel: string
  onCallToAction: () => void
  backgroundMediaUrl: string
  backgroundMediaType?: 'image' | 'video'
  eyebrow?: string
}

interface CountdownState {
  days: string
  hours: string
  minutes: string
}

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, '0')
}

function getCountdown(eventDate: string | Date): CountdownState {
  const target = typeof eventDate === 'string' ? new Date(eventDate) : eventDate
  const diff = Math.max(target.getTime() - Date.now(), 0)

  const totalMinutes = Math.floor(diff / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  return {
    days: pad(days),
    hours: pad(hours),
    minutes: pad(minutes),
  }
}

export function PremiumEventHero({
  title,
  subtitle,
  eventDate,
  callToActionLabel,
  onCallToAction,
  backgroundMediaUrl,
  backgroundMediaType = 'image',
  eyebrow = 'Pulse Live Experience',
}: PremiumEventHeroProps) {
  const [countdown, setCountdown] = useState(() => getCountdown(eventDate))

  useEffect(() => {
    setCountdown(getCountdown(eventDate))

    const intervalId = window.setInterval(() => {
      setCountdown(getCountdown(eventDate))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [eventDate])

  return (
    <>
      <style>{`
        .premium-event-hero {
          position: relative;
          width: 100%;
          min-height: 90vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at top, var(--pulse-surface-accent) 0%, transparent 42%),
            linear-gradient(180deg, var(--pulse-color-primary-base) 0%, var(--pulse-color-primary-accent) 100%);
          isolation: isolate;
        }

        .premium-event-hero__media,
        .premium-event-hero__veil,
        .premium-event-hero__mesh {
          position: absolute;
          inset: 0;
        }

        .premium-event-hero__media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.04);
          filter: blur(6px) saturate(108%);
        }

        .premium-event-hero__veil {
          background:
            linear-gradient(180deg, var(--pulse-overlay-backdrop) 0%, color-mix(in srgb, var(--pulse-color-primary-base) 88%, transparent) 100%);
        }

        .premium-event-hero__mesh {
          background:
            radial-gradient(circle at 50% 22%, var(--pulse-overlay-soft) 0%, transparent 28%),
            radial-gradient(circle at 82% 18%, var(--pulse-surface-accent) 0%, transparent 24%),
            linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--pulse-color-primary-base) 54%, transparent) 100%);
          mix-blend-mode: screen;
          opacity: 0.92;
        }

        .premium-event-hero__content {
          position: relative;
          z-index: 1;
          width: min(100% - 2rem, 64rem);
          padding: 5rem 0;
          text-align: center;
          color: var(--pulse-color-text-inverse);
        }

        .premium-event-hero__eyebrow,
        .premium-event-hero__title,
        .premium-event-hero__subtitle,
        .premium-event-hero__countdown,
        .premium-event-hero__cta-wrap {
          opacity: 0;
          animation: premium-event-hero-reveal 760ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .premium-event-hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.9rem;
          border: 1px solid color-mix(in srgb, var(--pulse-color-text-inverse) 16%, transparent);
          border-radius: var(--pulse-radius-full);
          background: color-mix(in srgb, var(--pulse-color-text-inverse) 8%, transparent);
          font-family: var(--pulse-font-family);
          font-size: var(--pulse-font-size-caption);
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          animation-delay: 60ms;
          backdrop-filter: blur(16px);
        }

        .premium-event-hero__title {
          margin: 1.35rem 0 0;
          font-family: var(--pulse-font-family);
          font-size: clamp(3.25rem, 7vw, 6.25rem);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.06em;
          text-wrap: balance;
          animation-delay: 140ms;
        }

        .premium-event-hero__subtitle {
          margin: 1.25rem auto 0;
          max-width: 42rem;
          color: var(--pulse-color-text-inverse);
          opacity: 0.78;
          font-family: var(--pulse-font-family);
          font-size: clamp(1rem, 2vw, 1.18rem);
          line-height: 1.7;
          text-wrap: balance;
          animation-delay: 220ms;
        }

        .premium-event-hero__countdown {
          margin: 2.25rem auto 0;
          display: grid;
          width: min(100%, 32rem);
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.85rem;
          animation-delay: 300ms;
        }

        .premium-event-hero__countdown-card {
          padding: 1rem 0.85rem;
          border: 1px solid color-mix(in srgb, var(--pulse-color-text-inverse) 14%, transparent);
          border-radius: var(--pulse-radius-lg);
          background: color-mix(in srgb, var(--pulse-color-text-inverse) 8%, transparent);
          backdrop-filter: blur(20px);
          box-shadow: var(--pulse-shadow-medium);
        }

        .premium-event-hero__countdown-value {
          display: block;
          font-family: var(--pulse-font-family);
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.06em;
        }

        .premium-event-hero__countdown-label {
          display: block;
          margin-top: 0.45rem;
          font-family: var(--pulse-font-family);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          opacity: 0.74;
          text-transform: uppercase;
        }

        .premium-event-hero__cta-wrap {
          position: relative;
          margin-top: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation-delay: 380ms;
        }

        .premium-event-hero__cta-pulse {
          position: absolute;
          width: 13rem;
          height: 13rem;
          border-radius: var(--pulse-radius-full);
          background: radial-gradient(circle, var(--pulse-surface-accent) 0%, var(--pulse-overlay-soft) 38%, transparent 74%);
          filter: blur(16px);
          animation: premium-event-hero-pulse 2.8s ease-in-out infinite;
          pointer-events: none;
        }

        .premium-event-hero__cta {
          position: relative;
          z-index: 1;
          min-width: 12rem;
          border: 0;
          border-radius: var(--pulse-radius-full);
          padding: 1rem 1.7rem;
          background: var(--pulse-button-primary-bg);
          color: var(--pulse-color-text-on-accent);
          font-family: var(--pulse-font-family);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: var(--pulse-shadow-strong);
          transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
        }

        .premium-event-hero__cta:hover {
          background: var(--pulse-button-primary-hover);
          transform: translateY(-2px);
          box-shadow: var(--pulse-shadow-strong);
        }

        .premium-event-hero__cta:focus-visible {
          outline: 3px solid var(--pulse-focus-ring);
          outline-offset: 4px;
        }

        @keyframes premium-event-hero-reveal {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes premium-event-hero-pulse {
          0% {
            opacity: 0.42;
            transform: scale(0.86);
          }

          50% {
            opacity: 0.9;
            transform: scale(1.06);
          }

          100% {
            opacity: 0.42;
            transform: scale(0.86);
          }
        }

        @media (max-width: 768px) {
          .premium-event-hero {
            min-height: 90svh;
          }

          .premium-event-hero__content {
            width: min(100% - 1.5rem, 40rem);
            padding: 4.5rem 0 4rem;
          }

          .premium-event-hero__title {
            font-size: clamp(2.4rem, 11vw, 4rem);
            line-height: 0.96;
          }

          .premium-event-hero__subtitle {
            max-width: 22rem;
            font-size: 0.98rem;
            line-height: 1.65;
          }

          .premium-event-hero__countdown {
            gap: 0.65rem;
          }

          .premium-event-hero__countdown-card {
            padding: 0.85rem 0.65rem;
            border-radius: var(--pulse-radius-md);
          }

          .premium-event-hero__countdown-value {
            font-size: clamp(1.45rem, 8vw, 2rem);
          }

          .premium-event-hero__countdown-label {
            font-size: 0.64rem;
          }

          .premium-event-hero__cta-wrap {
            width: 100%;
          }

          .premium-event-hero__cta {
            width: min(100%, 21rem);
          }

          .premium-event-hero__cta-pulse {
            width: 10rem;
            height: 10rem;
          }
        }
      `}</style>

      <section className="premium-event-hero">
        {backgroundMediaType === 'video' ? (
          <video
            className="premium-event-hero__media"
            src={backgroundMediaUrl}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
        ) : (
          <img className="premium-event-hero__media" src={backgroundMediaUrl} alt="" aria-hidden="true" />
        )}

        <div className="premium-event-hero__veil" />
        <div className="premium-event-hero__mesh" />

        <div className="premium-event-hero__content">
          <div className="premium-event-hero__eyebrow">{eyebrow}</div>
          <h1 className="premium-event-hero__title">{title}</h1>
          <p className="premium-event-hero__subtitle">{subtitle}</p>

          <div className="premium-event-hero__countdown" aria-label="Contador regressivo">
            <div className="premium-event-hero__countdown-card">
              <span className="premium-event-hero__countdown-value">{countdown.days}</span>
              <span className="premium-event-hero__countdown-label">Dias</span>
            </div>

            <div className="premium-event-hero__countdown-card">
              <span className="premium-event-hero__countdown-value">{countdown.hours}</span>
              <span className="premium-event-hero__countdown-label">Horas</span>
            </div>

            <div className="premium-event-hero__countdown-card">
              <span className="premium-event-hero__countdown-value">{countdown.minutes}</span>
              <span className="premium-event-hero__countdown-label">Min</span>
            </div>
          </div>

          <div className="premium-event-hero__cta-wrap">
            <span className="premium-event-hero__cta-pulse" />
            <button type="button" className="premium-event-hero__cta" onClick={onCallToAction}>
              {callToActionLabel}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export type { PremiumEventHeroProps }
