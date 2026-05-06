import { describe, it, expect } from 'vitest'
import { createActor } from 'xstate'
import { step2Machine, computeClass } from '../../../src/machines/step2Machine'

function makeActor() {
  const actor = createActor(step2Machine)
  actor.start()
  return actor
}

describe('step2Machine', () => {
  it('step2m.init: starts in configuring', () => {
    const a = makeActor()
    expect(a.getSnapshot().value).toBe('configuring')
    a.stop()
  })

  it('step2m.inv.03: single answer keeps configuring state', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: true })
    expect(a.getSnapshot().value).toBe('configuring')
    a.stop()
  })

  it('step2m.inv.03: two answers keeps configuring state', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: true })
    a.send({ type: 'SET_ACTIVE', value: false })
    expect(a.getSnapshot().value).toBe('configuring')
    a.stop()
  })

  it('step2m.inv.04: Class III — invasive=true, duration=long-term', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: true })
    a.send({ type: 'SET_ACTIVE', value: false })
    a.send({ type: 'SET_DURATION', value: 'long-term' })
    expect(a.getSnapshot().value).toBe('result')
    expect(computeClass(a.getSnapshot().context)?.class).toBe('Class III')
    a.stop()
  })

  it('step2m.inv.05: Class IIb — active=true, duration=short-term, not invasive long-term', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: false })
    a.send({ type: 'SET_ACTIVE', value: true })
    a.send({ type: 'SET_DURATION', value: 'short-term' })
    expect(a.getSnapshot().value).toBe('result')
    expect(computeClass(a.getSnapshot().context)?.class).toBe('Class IIb')
    a.stop()
  })

  it('step2m.inv.06: Class I — invasive=false, active=false', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: false })
    a.send({ type: 'SET_ACTIVE', value: false })
    a.send({ type: 'SET_DURATION', value: 'transient' })
    expect(a.getSnapshot().value).toBe('result')
    expect(computeClass(a.getSnapshot().context)?.class).toBe('Class I')
    a.stop()
  })

  it('step2m.iia: Class IIa — catch-all (invasive, short-term)', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: true })
    a.send({ type: 'SET_ACTIVE', value: false })
    a.send({ type: 'SET_DURATION', value: 'short-term' })
    expect(a.getSnapshot().value).toBe('result')
    expect(computeClass(a.getSnapshot().context)?.class).toBe('Class IIa')
    a.stop()
  })

  it('step2m.prog.02: CONTINUE from result → done (final)', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: false })
    a.send({ type: 'SET_ACTIVE', value: false })
    a.send({ type: 'SET_DURATION', value: 'transient' })
    a.send({ type: 'CONTINUE' })
    expect(a.getSnapshot().value).toBe('done')
    a.stop()
  })

  it('step2m.react.back: BACK → back (final)', () => {
    const a = makeActor()
    a.send({ type: 'BACK' })
    expect(a.getSnapshot().value).toBe('back')
    a.stop()
  })

  it('step2m.react.01: re-answering question updates result synchronously', () => {
    const a = makeActor()
    a.send({ type: 'SET_INVASIVE', value: false })
    a.send({ type: 'SET_ACTIVE', value: false })
    a.send({ type: 'SET_DURATION', value: 'transient' })
    expect(computeClass(a.getSnapshot().context)?.class).toBe('Class I')
    // Change active → result must change
    a.send({ type: 'SET_ACTIVE', value: true })
    // invasive=false, active=true, duration=transient → Class IIa (catch-all)
    expect(computeClass(a.getSnapshot().context)?.class).toBe('Class IIa')
    a.stop()
  })

  describe('computeClass pure function', () => {
    it('returns null when any field is missing', () => {
      expect(computeClass({ invasive: null, active: null, duration: '' })).toBeNull()
      expect(computeClass({ invasive: true, active: null, duration: 'long-term' })).toBeNull()
      expect(computeClass({ invasive: true, active: false, duration: '' })).toBeNull()
    })

    it('Class I: invasive=false, active=false, any duration', () => {
      expect(computeClass({ invasive: false, active: false, duration: 'transient' })?.class).toBe('Class I')
      expect(computeClass({ invasive: false, active: false, duration: 'long-term' })?.class).toBe('Class I')
    })

    it('Class III: invasive=true, duration=long-term', () => {
      expect(computeClass({ invasive: true, active: false, duration: 'long-term' })?.class).toBe('Class III')
      expect(computeClass({ invasive: true, active: true, duration: 'long-term' })?.class).toBe('Class III')
    })

    it('Class IIb: active=true, duration=short-term, NOT Class III conditions', () => {
      expect(computeClass({ invasive: false, active: true, duration: 'short-term' })?.class).toBe('Class IIb')
    })
  })
})
