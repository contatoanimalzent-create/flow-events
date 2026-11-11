// Aggregate-only snapshot checked against production on 2026-11-11.
// Counts are records, not unique people or verified attendance.
// Future events and demo records are excluded. No attendee personal data.
export const TRACK_RECORD_AS_OF = '11/11/2026'
export const TRACK_RECORD_EVENTS = [
  {
    "name": "BSB FIGHT 5",
    "date": "2026-05-28",
    "tickets": 0,
    "staff": 166,
    "entries": 0
  },
  {
    "name": "Capital Strike - A Origem",
    "date": "2026-06-05",
    "tickets": 1127,
    "staff": 173,
    "entries": 6
  },
  {
    "name": "BSB FIGHT 6",
    "date": "2026-07-16",
    "tickets": 0,
    "staff": 248,
    "entries": 0
  },
  {
    "name": "Seminarios Nocaute - Fabricio Werdum",
    "date": "2026-08-29",
    "tickets": 400,
    "staff": 0,
    "entries": 68
  },
  {
    "name": "Protur Educacional",
    "date": "2026-09-19",
    "tickets": 169,
    "staff": 0,
    "entries": 58
  },
  {
    "name": "BSB FIGHT 7",
    "date": "2026-09-24",
    "tickets": 3290,
    "staff": 145,
    "entries": 0
  },
  {
    "name": "Seminário BSB FIGHT · Rangel Farias",
    "date": "2026-10-24",
    "tickets": 429,
    "staff": 0,
    "entries": 0
  },
  {
    "name": "Seminário BSB FIGHT · Maurício Shogun",
    "date": "2026-10-31",
    "tickets": 327,
    "staff": 0,
    "entries": 0
  },
  {
    "name": "Seminário BSB FIGHT · Wanderlei Silva",
    "date": "2026-11-07",
    "tickets": 407,
    "staff": 0,
    "entries": 0
  }
] as const

export const TRACK_RECORD_TOTALS = {
  events: TRACK_RECORD_EVENTS.length,
  tickets: TRACK_RECORD_EVENTS.reduce((sum, event) => sum + event.tickets, 0),
  staff: TRACK_RECORD_EVENTS.reduce((sum, event) => sum + event.staff, 0),
}
