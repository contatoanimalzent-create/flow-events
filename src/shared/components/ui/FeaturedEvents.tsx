import { useId } from 'react'
import { cn } from '@/shared/lib'
import { EventCard, type EventCardProps } from './EventCard'

export interface FeaturedEventsItem extends EventCardProps {
  id: string
}

export interface FeaturedEventsProps {
  events: FeaturedEventsItem[]
  title?: string
  description?: string
  columns?: 3 | 4
  className?: string
}

export function FeaturedEvents({
  events,
  title = 'Eventos em destaque',
  description,
  columns = 3,
  className,
}: FeaturedEventsProps) {
  const titleId = useId()

  return (
    <>
      <style>{`
        .pulse-featured-events {
          position: relative;
          padding: clamp(4.5rem, 10vw, 7rem) 0;
        }

        .pulse-featured-events__inner {
          width: min(
            calc(100% - (2 * var(--pulse-grid-gutter-mobile, 1.25rem))),
            var(--pulse-grid-max-width, 78rem)
          );
          margin: 0 auto;
        }

        .pulse-featured-events__surface {
          position: relative;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--pulse-color-border) 88%, transparent);
          border-radius: calc(var(--pulse-radius-lg) + 0.75rem);
          background:
            radial-gradient(circle at top, color-mix(in srgb, var(--pulse-color-primary-soft) 12%, transparent) 0%, transparent 34%),
            linear-gradient(180deg, color-mix(in srgb, var(--pulse-color-background) 96%, transparent) 0%, color-mix(in srgb, var(--pulse-color-surface) 84%, var(--pulse-color-background)) 100%);
          box-shadow: var(--pulse-shadow-medium);
          padding: clamp(1.5rem, 4vw, 2.5rem);
        }

        .pulse-featured-events__surface::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--pulse-color-primary) 5%, transparent) 0%, transparent 32%),
            radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--pulse-color-primary-soft) 10%, transparent) 0%, transparent 22%);
          pointer-events: none;
        }

        .pulse-featured-events__header {
          position: relative;
          z-index: 1;
          max-width: 42rem;
          margin: 0 auto;
          text-align: center;
        }

        .pulse-featured-events__title {
          margin: 0;
          color: var(--pulse-color-primary);
          font-family: var(--pulse-font-family);
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.04em;
          text-wrap: balance;
        }

        .pulse-featured-events__description {
          margin: 1rem auto 0;
          max-width: 36rem;
          color: var(--pulse-color-text-secondary);
          font-family: var(--pulse-font-family);
          font-size: 1rem;
          line-height: 1.7;
          text-wrap: balance;
        }

        .pulse-featured-events__grid {
          position: relative;
          z-index: 1;
          margin-top: clamp(2rem, 5vw, 3rem);
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(1rem, 3vw, 1.75rem);
          align-items: stretch;
        }

        .pulse-featured-events__item {
          min-width: 0;
        }

        @media (min-width: 768px) {
          .pulse-featured-events__inner {
            width: min(
              calc(100% - (2 * var(--pulse-grid-gutter-tablet, 2rem))),
              var(--pulse-grid-max-width, 78rem)
            );
          }

          .pulse-featured-events__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1100px) {
          .pulse-featured-events__inner {
            width: min(
              calc(100% - (2 * var(--pulse-grid-gutter-desktop, 3rem))),
              var(--pulse-grid-max-width, 78rem)
            );
          }

          .pulse-featured-events__grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .pulse-featured-events--4-cols .pulse-featured-events__grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>

      <section
        className={cn('pulse-featured-events', columns === 4 && 'pulse-featured-events--4-cols', className)}
        aria-labelledby={titleId}
      >
        <div className="pulse-featured-events__inner">
          <div className="pulse-featured-events__surface">
            <header className="pulse-featured-events__header">
              <h2 id={titleId} className="pulse-featured-events__title">
                {title}
              </h2>
              {description ? (
                <p className="pulse-featured-events__description">{description}</p>
              ) : null}
            </header>

            <div className="pulse-featured-events__grid">
              {events.map((event) => (
                <div key={event.id} className="pulse-featured-events__item">
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
