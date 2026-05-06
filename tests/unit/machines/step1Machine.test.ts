import { describe, it, expect } from 'vitest'
import { createActor } from 'xstate'
import { step1Machine } from '../../../src/machines/step1Machine'

function makeActor() {
  const actor = createActor(step1Machine)
  actor.start()
  return actor
}

describe('step1Machine', () => {
  it('step1m.init: starts in idle', () => {
    const a = makeActor()
    expect(a.getSnapshot().value).toBe('idle')
    a.stop()
  })

  it('step1m.inv.03: short intended use (<10 chars) stays in filling', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: 'short' })
    expect(a.getSnapshot().value).toBe('filling')
    a.stop()
  })

  it('step1m.inv.05.bugfix: exactly 10 chars transitions to answering (>= 10)', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    expect(a.getSnapshot().value).toBe('answering')
    a.stop()
  })

  it('step1m.inv.05: 11 chars transitions to answering', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '12345678901' })
    expect(a.getSnapshot().value).toBe('answering')
    a.stop()
  })

  it('step1m.inv.04: partial answers remain in answering', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: true })
    expect(a.getSnapshot().value).toBe('answering')
    a.stop()
  })

  it('step1m.prog.01: all answered with one true → resultPositive', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: true })
    a.send({ type: 'CLAIM_ANSWERED', key: 'treat', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'monitor', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'prevent', value: false })
    expect(a.getSnapshot().value).toBe('resultPositive')
    a.stop()
  })

  it('step1m.prog.03: all answered as false → resultNegative', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'treat', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'monitor', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'prevent', value: false })
    expect(a.getSnapshot().value).toBe('resultNegative')
    a.stop()
  })

  it('step1m.prog.02: CONTINUE from resultPositive → done (final)', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: true })
    a.send({ type: 'CLAIM_ANSWERED', key: 'treat', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'monitor', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'prevent', value: false })
    a.send({ type: 'CONTINUE' })
    expect(a.getSnapshot().value).toBe('done')
    a.stop()
  })

  it('step1m.react: shortening use from resultPositive → filling', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: true })
    a.send({ type: 'CLAIM_ANSWERED', key: 'treat', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'monitor', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'prevent', value: false })
    expect(a.getSnapshot().value).toBe('resultPositive')
    a.send({ type: 'INTENDED_USE_CHANGED', value: 'short' })
    expect(a.getSnapshot().value).toBe('filling')
    a.stop()
  })

  it('step1m.react: resultNegative → resultPositive when claim set to true', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'treat', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'monitor', value: false })
    a.send({ type: 'CLAIM_ANSWERED', key: 'prevent', value: false })
    expect(a.getSnapshot().value).toBe('resultNegative')
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: true })
    expect(a.getSnapshot().value).toBe('resultPositive')
    a.stop()
  })

  it('step1m.context: intendedUse and answers update in context', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: 'My medical device' })
    expect(a.getSnapshot().context.intendedUse).toBe('My medical device')
    a.send({ type: 'CLAIM_ANSWERED', key: 'diagnose', value: true })
    expect(a.getSnapshot().context.answers.diagnose).toBe(true)
    a.stop()
  })

  it('step1m.back: BACK from answering → idle', () => {
    const a = makeActor()
    a.send({ type: 'INTENDED_USE_CHANGED', value: '1234567890' })
    a.send({ type: 'BACK' })
    expect(a.getSnapshot().value).toBe('idle')
    a.stop()
  })
})
