import { describe, it, expect } from 'vitest'
import { createActor } from 'xstate'
import { checklistMachine, completedCount, allDone } from '../../../src/machines/checklistMachine'

const THREE_TASKS = [
  { id: '1', title: 'Task 1', description: 'Desc 1' },
  { id: '2', title: 'Task 2', description: 'Desc 2' },
  { id: '3', title: 'Task 3', description: 'Desc 3' },
]

function makeActor(tasks = THREE_TASKS) {
  const actor = createActor(checklistMachine, { input: { tasks } })
  actor.start()
  return actor
}

describe('checklistMachine', () => {
  it('clm.init: starts in idle with empty completed map', () => {
    const a = makeActor()
    expect(a.getSnapshot().value).toBe('idle')
    expect(a.getSnapshot().context.completed).toEqual({})
    a.stop()
  })

  it('clm.toggle.one: toggling one task → inProgress', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    expect(a.getSnapshot().value).toBe('inProgress')
    a.stop()
  })

  it('clm.toggle.all: toggling all tasks → complete', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    a.send({ type: 'TOGGLE_TASK', id: '2' })
    a.send({ type: 'TOGGLE_TASK', id: '3' })
    expect(a.getSnapshot().value).toBe('complete')
    a.stop()
  })

  it('clm.toggle.untoggle: un-toggle from complete → inProgress', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    a.send({ type: 'TOGGLE_TASK', id: '2' })
    a.send({ type: 'TOGGLE_TASK', id: '3' })
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    expect(a.getSnapshot().value).toBe('inProgress')
    a.stop()
  })

  it('clm.toggle.to-idle: un-toggle last remaining task from inProgress → idle', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    expect(a.getSnapshot().value).toBe('idle')
    a.stop()
  })

  it('clm.inv.01: completed map tracks each task independently', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    const ctx = a.getSnapshot().context
    expect(ctx.completed['1']).toBe(true)
    expect(ctx.completed['2']).toBeFalsy()
    expect(ctx.completed['3']).toBeFalsy()
    a.stop()
  })

  it('clm.inv.05: toggle is bidirectional (completes then un-completes)', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '2' })
    expect(a.getSnapshot().context.completed['2']).toBe(true)
    a.send({ type: 'TOGGLE_TASK', id: '2' })
    expect(a.getSnapshot().context.completed['2']).toBe(false)
    a.stop()
  })

  it('clm.nav.forward: CONTINUE from idle → navigatingForward (final)', () => {
    const a = makeActor()
    a.send({ type: 'CONTINUE' })
    expect(a.getSnapshot().value).toBe('navigatingForward')
    a.stop()
  })

  it('clm.nav.forward: CONTINUE from inProgress → navigatingForward', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    a.send({ type: 'CONTINUE' })
    expect(a.getSnapshot().value).toBe('navigatingForward')
    a.stop()
  })

  it('clm.nav.forward: CONTINUE from complete → navigatingForward', () => {
    const a = makeActor()
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    a.send({ type: 'TOGGLE_TASK', id: '2' })
    a.send({ type: 'TOGGLE_TASK', id: '3' })
    a.send({ type: 'CONTINUE' })
    expect(a.getSnapshot().value).toBe('navigatingForward')
    a.stop()
  })

  it('clm.nav.back: BACK from idle → navigatingBack (final)', () => {
    const a = makeActor()
    a.send({ type: 'BACK' })
    expect(a.getSnapshot().value).toBe('navigatingBack')
    a.stop()
  })

  it('clm.single-task: toggling single task goes directly to complete', () => {
    const single = [{ id: '1', title: 'Only Task', description: 'Desc' }]
    const a = makeActor(single)
    a.send({ type: 'TOGGLE_TASK', id: '1' })
    expect(a.getSnapshot().value).toBe('complete')
    a.stop()
  })

  it('clm.tasks-propagated: tasks are available in context from input', () => {
    const a = makeActor()
    expect(a.getSnapshot().context.tasks).toEqual(THREE_TASKS)
    a.stop()
  })
})

describe('checklistMachine helpers', () => {
  it('completedCount: counts true values', () => {
    expect(completedCount({ '1': true, '2': false, '3': true })).toBe(2)
    expect(completedCount({})).toBe(0)
  })

  it('allDone: true only when all tasks completed', () => {
    const ctx = { tasks: THREE_TASKS, completed: { '1': true, '2': true, '3': true } }
    expect(allDone(ctx)).toBe(true)
  })

  it('allDone: false when partial', () => {
    const ctx = { tasks: THREE_TASKS, completed: { '1': true, '2': false } }
    expect(allDone(ctx)).toBe(false)
  })

  it('allDone: false when no tasks completed', () => {
    const ctx = { tasks: THREE_TASKS, completed: {} }
    expect(allDone(ctx)).toBe(false)
  })
})
