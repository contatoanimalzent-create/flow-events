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
            radial-gradient(circle at top, rgba(0, 123, 255, 0.18), transparent 42%),
            linear-gradient(180deg, rgba(0, 19, 60, 0.88) 0%, rgba(0, 51, 160, 0.94) 100%);
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
          background: rgba(0, 51, 160, 0.8);
        }

        .pulse-hero__ambient {
          background:
            radial-gradient(circle at 50% 35%, rgba(255, 255, 255, 0.12), transparent 28%),
            radial-gradient(circle at 50% 75%, rgba(0, 123, 255, 0.18), transparent 22%);
          mix-blend-mode: screen;
        }

        .pulse-hero__content {
          position: relative;
          z-index: 1;
          width: min(100%, 56rem);
          padding: 2rem 1.5rem;
          text-align: center;
          color: #ffffff;
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
          color: #e5edf8;
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
          background:
            radial-gradient(circle, rgba(0, 123, 255, 0.38) 0%, rgba(0, 123, 255, 0.16) 42%, transparent 72%);
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
          background: var(--pulse-color-primary-accent, #007BFF);
          color: #ffffff;
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 18px 42px rgba(0, 123, 255, 0.32);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background-color 180ms ease;
        }

        .pulse-hero__cta:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 22px 52px rgba(0, 123, 255, 0.42);
        }

        .pulse-hero__cta:focus-visible {
          outline: 3px solid rgba(255, 255, 255, 0.7);
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
