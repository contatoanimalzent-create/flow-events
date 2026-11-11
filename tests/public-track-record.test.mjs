import test from 'node:test'
import assert from 'node:assert/strict'
import { TRACK_RECORD_EVENTS, TRACK_RECORD_TOTALS } from '../src/shared/lib/public-track-record.ts'

test('published totals reconcile with the historical event records', () => {
  assert.deepEqual(TRACK_RECORD_TOTALS, { events: 9, tickets: 6149, staff: 732 })
})
test('historical metrics exclude upcoming events and contain no personal records', () => {
  for (const event of TRACK_RECORD_EVENTS) {
    assert.ok(event.date < '2026-11-11')
    assert.deepEqual(Object.keys(event).sort(), ['date', 'entries', 'name', 'staff', 'tickets'])
    for (const key of ['tickets', 'staff', 'entries']) assert.ok(Number.isInteger(event[key]) && event[key] >= 0)
  }
})
