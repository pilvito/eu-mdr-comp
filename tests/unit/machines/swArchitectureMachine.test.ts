import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createActor } from 'xstate'
import { swArchitectureMachine } from '../../../src/machines/swArchitectureMachine'

function makeActor() {
  const actor = createActor(swArchitectureMachine)
  actor.start()
  return actor
}

describe('swArchitectureMachine', () => {
  it('archm.init: starts in editing with demo item active', () => {
    const a = makeActor()
    const snap = a.getSnapshot()
    expect(snap.value).toBe('editing')
    expect(snap.context.items).toHaveLength(1)
    expect(snap.context.items[0].name).toBe('EHR Core Database')
    expect(snap.context.activeItemId).toBe('demo-item-1')
    expect(snap.context.activeTab).toBe('requirements')
    expect(snap.context.savedStatus).toBe(false)
    a.stop()
  })

  it('archm.select: SELECT_ITEM updates activeItemId', () => {
    const a = makeActor()
    a.send({ type: 'SELECT_ITEM', id: 'demo-item-1' })
    expect(a.getSnapshot().context.activeItemId).toBe('demo-item-1')
    a.stop()
  })

  it('archm.inv.07: SWITCH_TAB toggles between requirements and architecture', () => {
    const a = makeActor()
    expect(a.getSnapshot().context.activeTab).toBe('requirements')
    a.send({ type: 'SWITCH_TAB', tab: 'architecture' })
    expect(a.getSnapshot().context.activeTab).toBe('architecture')
    a.send({ type: 'SWITCH_TAB', tab: 'requirements' })
    expect(a.getSnapshot().context.activeTab).toBe('requirements')
    a.stop()
  })

  it('archm.inv.04: ADD_ITEM with whitespace-only name is a no-op', () => {
    const a = makeActor()
    a.send({ type: 'ADD_ITEM', name: '   ' })
    expect(a.getSnapshot().context.items).toHaveLength(1)
    a.stop()
  })

  it('archm.inv.04: ADD_ITEM with empty string is a no-op', () => {
    const a = makeActor()
    a.send({ type: 'ADD_ITEM', name: '' })
    expect(a.getSnapshot().context.items).toHaveLength(1)
    a.stop()
  })

  it('archm.prog.01: ADD_ITEM with valid name adds item and auto-activates it', () => {
    const a = makeActor()
    a.send({ type: 'ADD_ITEM', name: 'Auth Service' })
    const snap = a.getSnapshot()
    expect(snap.context.items).toHaveLength(2)
    const newItem = snap.context.items.find(i => i.name === 'Auth Service')
    expect(newItem).toBeDefined()
    expect(newItem?.requirements).toEqual([])
    expect(newItem?.architectureDetails).toBe('')
    expect(snap.context.activeItemId).toBe(newItem?.id)
    a.stop()
  })

  it('archm.inv.03: ADD_REQUIREMENT with empty text is a no-op', () => {
    const a = makeActor()
    const before = a.getSnapshot().context.items[0].requirements.length
    a.send({ type: 'ADD_REQUIREMENT', text: '' })
    expect(a.getSnapshot().context.items[0].requirements).toHaveLength(before)
    a.stop()
  })

  it('archm.inv.03: ADD_REQUIREMENT with whitespace text is a no-op', () => {
    const a = makeActor()
    const before = a.getSnapshot().context.items[0].requirements.length
    a.send({ type: 'ADD_REQUIREMENT', text: '   ' })
    expect(a.getSnapshot().context.items[0].requirements).toHaveLength(before)
    a.stop()
  })

  it('archm.prog.02: ADD_REQUIREMENT appends requirement to active item', () => {
    const a = makeActor()
    a.send({ type: 'ADD_REQUIREMENT', text: 'Must handle 10k concurrent requests' })
    const item = a.getSnapshot().context.items.find(i => i.id === 'demo-item-1')
    expect(item?.requirements).toHaveLength(2)
    expect(item?.requirements[1].text).toBe('Must handle 10k concurrent requests')
    a.stop()
  })

  it('archm.inv.02: multiple requirements are ordered by insertion', () => {
    const a = makeActor()
    a.send({ type: 'ADD_REQUIREMENT', text: 'Second requirement' })
    a.send({ type: 'ADD_REQUIREMENT', text: 'Third requirement' })
    const item = a.getSnapshot().context.items.find(i => i.id === 'demo-item-1')
    expect(item?.requirements[1].text).toBe('Second requirement')
    expect(item?.requirements[2].text).toBe('Third requirement')
    a.stop()
  })

  it('archm.react.04: UPDATE_ARCHITECTURE updates architectureDetails for active item', () => {
    const a = makeActor()
    a.send({ type: 'UPDATE_ARCHITECTURE', value: 'Microservices on Kubernetes' })
    const item = a.getSnapshot().context.items.find(i => i.id === 'demo-item-1')
    expect(item?.architectureDetails).toBe('Microservices on Kubernetes')
    a.stop()
  })

  it('archm.prog.03: SAVE transitions to saving and sets savedStatus=true', () => {
    const a = makeActor()
    a.send({ type: 'SAVE' })
    const snap = a.getSnapshot()
    expect(snap.value).toBe('saving')
    expect(snap.context.savedStatus).toBe(true)
    a.stop()
  })

  describe('saving timeout', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('archm.prog.03: after 2s in saving → returns to editing with savedStatus=false', () => {
      const a = makeActor()
      a.send({ type: 'SAVE' })
      expect(a.getSnapshot().value).toBe('saving')
      vi.advanceTimersByTime(2000)
      expect(a.getSnapshot().value).toBe('editing')
      expect(a.getSnapshot().context.savedStatus).toBe(false)
      a.stop()
    })

    it('archm.prog.03: before 2s, still in saving state', () => {
      const a = makeActor()
      a.send({ type: 'SAVE' })
      vi.advanceTimersByTime(1999)
      expect(a.getSnapshot().value).toBe('saving')
      a.stop()
    })
  })

  it('archm.inv.08: ADD_REQUIREMENT targets only the active item', () => {
    const a = makeActor()
    a.send({ type: 'ADD_ITEM', name: 'API Gateway' })
    const newItemId = a.getSnapshot().context.activeItemId
    a.send({ type: 'ADD_REQUIREMENT', text: 'Route all traffic' })
    const demo = a.getSnapshot().context.items.find(i => i.id === 'demo-item-1')
    const newItem = a.getSnapshot().context.items.find(i => i.id === newItemId)
    expect(demo?.requirements).toHaveLength(1)
    expect(newItem?.requirements).toHaveLength(1)
    expect(newItem?.requirements[0].text).toBe('Route all traffic')
    a.stop()
  })
})
