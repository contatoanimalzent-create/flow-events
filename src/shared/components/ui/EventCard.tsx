import { CalendarDays, MapPin } from 'lucide-react'

interface EventCardProps {
  imageUrl: string
  eventName: string
  date: string
  location: string
  badge?: string
  badgeTone?: 'default' | 'live' | 'warning'
  onClick: () => void
}

export function EventCard({
  imageUrl,
  eventName,
  date,
  location,
  badge,
  badgeTone = 'default',
  onClick,
}: EventCardProps) {
  return (
    <>
      <style>{`
        .pulse-event-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid var(--pulse-color-border);
          border-radius: var(--pulse-radius-lg);
          background: linear-gradient(180deg, var(--pulse-surface-base) 0%, var(--pulse-surface-muted) 100%);
          box-shadow: var(--pulse-shadow-soft);
          cursor: pointer;
          text-align: left;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background-color 180ms ease;
        }

        .pulse-event-card:hover {
          transform: translateY(-5px);
          border-color: var(--pulse-color-primary-accent);
          box-shadow: var(--pulse-shadow-medium);
        }

        .pulse-event-card:focus-visible {
          outline: 3px solid var(--pulse-focus-ring);
          outline-offset: 4px;
        }

        .pulse-event-card__media {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: linear-gradient(135deg, var(--pulse-overlay-soft) 0%, var(--pulse-surface-accent) 100%);
        }

        .pulse-event-card__badge {
          position: absolute;
          left: 1rem;
          top: 1rem;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          min-height: 2rem;
          padding: 0 0.8rem;
          border-radius: var(--pulse-radius-full);
          border: 1px solid var(--pulse-color-border);
          background: color-mix(in srgb, var(--pulse-color-background) 84%, transparent);
          color: var(--pulse-color-primary-base);
          font-family: var(--pulse-font-family);
          font-size: var(--pulse-font-size-caption);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          backdrop-filter: blur(14px);
          box-shadow: var(--pulse-shadow-soft);
        }

        .pulse-event-card__badge::before {
          content: '';
          width: 0.5rem;
          height: 0.5rem;
          border-radius: var(--pulse-radius-full);
          background: var(--pulse-color-primary-accent);
          flex: none;
        }

        .pulse-event-card__badge--live {
          border-color: var(--pulse-status-success-border);
          background: color-mix(in srgb, var(--pulse-status-success-surface) 72%, var(--pulse-color-background));
          color: var(--pulse-status-success);
        }

        .pulse-event-card__badge--live::before {
          background: var(--pulse-status-success);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--pulse-status-success-surface) 72%, transparent);
        }

        .pulse-event-card__badge--warning {
          border-color: var(--pulse-status-warning-border);
          background: color-mix(in srgb, var(--pulse-status-warning-surface) 72%, var(--pulse-color-background));
          color: var(--pulse-status-warning);
        }

        .pulse-event-card__badge--warning::before {
          background: var(--pulse-status-warning);
        }

        .pulse-event-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 320ms ease;
        }

        .pulse-event-card:hover .pulse-event-card__image {
          transform: scale(1.035);
        }

        .pulse-event-card__media::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--pulse-color-primary-base) 18%, transparent) 100%);
        }

        .pulse-event-card__content {
          padding: 1.2rem 1.2rem 1.25rem;
        }

        .pulse-event-card__title {
          margin: 0;
          color: var(--pulse-color-text-primary);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 1.15rem;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .pulse-event-card__meta {
          margin-top: 1rem;
          display: grid;
          gap: 0.75rem;
        }

        .pulse-event-card__meta-row {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          color: var(--pulse-color-text-secondary);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.94rem;
          line-height: 1.45;
        }

        .pulse-event-card__icon {
          flex: none;
          color: var(--pulse-color-primary-base);
        }

        @media (max-width: 640px) {
          .pulse-event-card {
            border-radius: var(--pulse-radius-md);
          }

          .pulse-event-card__badge {
            left: 0.85rem;
            top: 0.85rem;
          }

          .pulse-event-card__content {
            padding: 1rem;
          }

          .pulse-event-card__title {
            font-size: 1rem;
          }

          .pulse-event-card__meta-row {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <button type="button" className="pulse-event-card" onClick={onClick}>
        <div className="pulse-event-card__media">
          {badge ? (
            <span
              className={[
                'pulse-event-card__badge',
                badgeTone === 'live' ? 'pulse-event-card__badge--live' : '',
                badgeTone === 'warning' ? 'pulse-event-card__badge--warning' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {badge}
            </span>
          ) : null}
          <img className="pulse-event-card__image" src={imageUrl} alt={eventName} />
        </div>

        <div className="pulse-event-card__content">
          <h3 className="pulse-event-card__title">{eventName}</h3>

          <div className="pulse-event-card__meta">
            <div className="pulse-event-card__meta-row">
              <CalendarDays className="pulse-event-card__icon" size={16} aria-hidden="true" />
              <span>{date}</span>
            </div>

            <div className="pulse-event-card__meta-row">
              <MapPin className="pulse-event-card__icon" size={16} aria-hidden="true" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </button>
    </>
  )
}

export type { EventCardProps }
