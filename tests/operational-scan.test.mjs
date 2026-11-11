import test from 'node:test'
import assert from 'node:assert/strict'
import { validateOperationalScan } from '../src/core/operator/operational-scan.ts'

test('offline scans never call the access service or grant entry', async () => {
  let calls = 0
  const result = await validateOperationalScan({ isOnline: false, eventId: 'event-1' }, async () => { calls++; return { valid: true } })
  assert.equal(calls, 0)
  assert.equal(result.valid, false)
  assert.equal(result.reason, 'offline')
})
test('missing event never calls the access service, including when online', async () => {
  for (const eventId of [null, undefined, '', '  ']) {
    const result = await validateOperationalScan({ isOnline: true, eventId }, async () => assert.fail('must not call'))
    assert.equal(result.valid, false)
    assert.equal(result.reason, 'missing_event')
  }
})
test('online validation preserves the server refusal for used tickets', async () => {
  const refusal = { valid: false, reason: 'already_used', message: 'Já utilizado' }
  assert.strictEqual(await validateOperationalScan({ isOnline: true, eventId: 'event-1' }, async () => refusal), refusal)
})
test('only server-authorized access returns success for the selected event', async () => {
  const accepted = { valid: true, name: 'Participante' }
  const result = await validateOperationalScan({ isOnline: true, eventId: 'event-1' }, async eventId => { assert.equal(eventId, 'event-1'); return accepted })
  assert.strictEqual(result, accepted)
})
test('connection failure never becomes success', async () => {
  await assert.rejects(validateOperationalScan({ isOnline: true, eventId: 'event-1' }, async () => { throw new Error('Network failure') }), /Network failure/)
})
test('reconnection performs fresh validation instead of accepting a queued reading', async () => {
  let calls = 0
  const validate = async () => { calls++; return { valid: false, reason: 'already_used' } }
  assert.equal((await validateOperationalScan({ isOnline: false, eventId: 'event-1' }, validate)).valid, false)
  const reconnected = await validateOperationalScan({ isOnline: true, eventId: 'event-1' }, validate)
  assert.equal(reconnected.valid, false)
  assert.equal(reconnected.reason, 'already_used')
  assert.equal(calls, 1)
})
