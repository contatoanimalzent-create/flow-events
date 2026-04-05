interface PulseHeroProps {
  title: string
  subtitle: string
  callToActionLabel: string
  onCallToAction: () => void
  backgroundVideoUrl: string
}

export function PulseHero({
  title,
  subtitle,
  callToActionLabel,
  onCallToAction,
  backgroundVideoUrl,
}: PulseHeroProps) {
  return (
    <>
      <style>{`
        .pulse-hero {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at top, var(--pulse-surface-accent), transparent 42%),
            linear-gradient(180deg, var(--pulse-color-primary-base) 0%, var(--pulse-button-primary-bg) 100%);
        }

        .pulse-hero__video,
        .pulse-hero__overlay,
        .pulse-hero__ambient {
          position: absolute;
          inset: 0;
        }

        .pulse-hero__video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pulse-hero__overlay {
          background: var(--pulse-overlay-backdrop);
        }

        .pulse-hero__ambient {
          background:
            radial-gradient(circle at 50% 35%, var(--pulse-overlay-soft), transparent 28%),
            radial-gradient(circle at 50% 75%, var(--pulse-surface-accent), transparent 22%);
          mix-blend-mode: screen;
        }

        .pulse-hero__content {
          position: relative;
          z-index: 1;
          width: min(100%, 56rem);
          padding: 2rem 1.5rem;
          text-align: center;
          color: var(--pulse-color-text-inverse);
        }

        .pulse-hero__title {
          margin: 0;
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: clamp(2.75rem, 7vw, 5.75rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          text-wrap: balance;
        }

        .pulse-hero__subtitle {
          margin: 1.25rem auto 0;
          max-width: 42rem;
          color: var(--pulse-color-text-inverse);
          opacity: 0.86;
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: clamp(1rem, 2vw, 1.3rem);
          line-height: 1.75;
          text-wrap: balance;
        }

        .pulse-hero__cta-wrap {
          position: relative;
          margin-top: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pulse-hero__cta-glow {
          position: absolute;
          width: 11.5rem;
          height: 11.5rem;
          border-radius: 999px;
          background: radial-gradient(circle, var(--pulse-overlay-soft) 0%, var(--pulse-surface-accent) 42%, transparent 72%);
          filter: blur(8px);
          animation: pulse-hero-ring 2.8s ease-in-out infinite;
          pointer-events: none;
        }

        .pulse-hero__cta {
          position: relative;
          z-index: 1;
          border: 0;
          border-radius: 999px;
          padding: 0.95rem 1.75rem;
          background: var(--pulse-button-primary-bg);
          color: var(--pulse-color-text-on-accent);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: var(--pulse-shadow-soft);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background-color 180ms ease;
        }

        .pulse-hero__cta:hover {
          background: var(--pulse-button-primary-hover);
          transform: translateY(-2px) scale(1.01);
          box-shadow: var(--pulse-shadow-hover);
        }

        .pulse-hero__cta:focus-visible {
          outline: 3px solid var(--pulse-focus-ring);
          outline-offset: 4px;
        }

        @keyframes pulse-hero-ring {
          0% {
            opacity: 0.45;
            transform: scale(0.86);
          }

          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }

          100% {
            opacity: 0.45;
            transform: scale(0.86);
          }
        }

        @media (max-width: 768px) {
          .pulse-hero__content {
            padding: 1.75rem 1.25rem 2.5rem;
          }

          .pulse-hero__title {
            font-size: clamp(2.2rem, 12vw, 3.5rem);
            line-height: 1.02;
          }

          .pulse-hero__subtitle {
            margin-top: 1rem;
            font-size: 0.98rem;
            line-height: 1.65;
            max-width: 24rem;
          }

          .pulse-hero__cta-wrap {
            margin-top: 1.5rem;
            width: 100%;
          }

          .pulse-hero__cta {
            width: min(100%, 22rem);
            padding: 0.95rem 1.35rem;
            font-size: 0.88rem;
          }

          .pulse-hero__cta-glow {
            width: 9rem;
            height: 9rem;
          }
        }
      `}</style>

      <section className="pulse-hero">
        <video
          className="pulse-hero__video"
          src={backgroundVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />

        <div className="pulse-hero__overlay" />
        <div className="pulse-hero__ambient" />

        <div className="pulse-hero__content">
          <h1 className="pulse-hero__title">{title}</h1>
          <p className="pulse-hero__subtitle">{subtitle}</p>

          <div className="pulse-hero__cta-wrap">
            <span className="pulse-hero__cta-glow" />
            <button type="button" className="pulse-hero__cta" onClick={onCallToAction}>
              {callToActionLabel}
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

export type { PulseHeroProps }
