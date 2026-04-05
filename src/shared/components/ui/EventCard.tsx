import { CalendarDays, MapPin } from 'lucide-react'

interface EventCardProps {
  imageUrl: string
  eventName: string
  date: string
  location: string
  onClick: () => void
}

export function EventCard({ imageUrl, eventName, date, location, onClick }: EventCardProps) {
  return (
    <>
      <style>{`
        .pulse-event-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid var(--pulse-color-border);
          border-radius: 1.5rem;
          background: linear-gradient(180deg, var(--pulse-surface-base) 0%, var(--pulse-surface-muted) 100%);
          box-shadow: var(--pulse-shadow-soft);
          cursor: pointer;
          text-align: left;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .pulse-event-card:hover {
          transform: translateY(-3px);
          border-color: var(--pulse-color-primary-accent);
          box-shadow: var(--pulse-shadow-hover);
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
          background: linear-gradient(180deg, transparent 0%, var(--pulse-surface-accent) 100%);
        }

        .pulse-event-card__content {
          padding: 1.15rem 1.15rem 1.2rem;
        }

        .pulse-event-card__title {
          margin: 0;
          color: var(--pulse-color-text-primary);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.35;
        }

        .pulse-event-card__meta {
          margin-top: 0.95rem;
          display: grid;
          gap: 0.7rem;
        }

        .pulse-event-card__meta-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          color: var(--pulse-color-text-secondary);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.95rem;
          line-height: 1.45;
        }

        .pulse-event-card__icon {
          flex: none;
          color: var(--pulse-color-primary-base);
        }

        @media (max-width: 640px) {
          .pulse-event-card {
            border-radius: 1.25rem;
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
