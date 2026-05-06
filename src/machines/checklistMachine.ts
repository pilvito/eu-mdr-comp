/**
 * @spec specs/components/checklist-step.md
 * @implements INV-CL-01, INV-CL-02, INV-CL-03, INV-CL-04, INV-CL-05, INV-CL-06
 * @implements PROG-CL-01, PROG-CL-02, PROG-CL-03
 * @implements REACT-CL-01, REACT-CL-02, REACT-CL-03, REACT-CL-04
 *
 * Parametric machine: takes tasks[] as input context.
 * Used by Steps 3–9, SaMD Planning.
 */
import { setup, assign } from 'xstate'

export interface Task {
  id: string
  title: string
  description: string
}

export interface ChecklistContext {
  tasks: Task[]
  completed: Record<string, boolean>
}

export type ChecklistEvent =
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'CONTINUE' }
  | { type: 'BACK' }

const completedCount = (completed: Record<string, boolean>) =>
  Object.values(completed).filter(Boolean).length

const allDone = (ctx: ChecklistContext) =>
  ctx.tasks.length > 0 && completedCount(ctx.completed) === ctx.tasks.length

export const checklistMachine = setup({
  types: {
    context: {} as ChecklistContext,
    events: {} as ChecklistEvent,
    input: {} as { tasks: Task[] },
  },
  guards: {
    allDone: ({ context }) => allDone(context),
    someDone: ({ context }) =>
      completedCount(context.completed) > 0 && !allDone(context),
    noneDone: ({ context }) => completedCount(context.completed) === 0,
    willBeAllDone: ({ context, event }) => {
      if (event.type !== 'TOGGLE_TASK') return false
      const currentlyDone = context.completed[event.id]
      const countAfter = currentlyDone
        ? completedCount(context.completed) - 1
        : completedCount(context.completed) + 1
      return countAfter === context.tasks.length
    },
    willBeNoneDone: ({ context, event }) => {
      if (event.type !== 'TOGGLE_TASK') return false
      const currentlyDone = context.completed[event.id]
      const countAfter = currentlyDone
        ? completedCount(context.completed) - 1
        : completedCount(context.completed) + 1
      return countAfter === 0
    },
  },
  actions: {
    toggleTask: assign({
      completed: ({ context, event }) => {
        if (event.type !== 'TOGGLE_TASK') return context.completed
        return { ...context.completed, [event.id]: !context.completed[event.id] }
      },
    }),
  },
}).createMachine({
  id: 'checklist',
  initial: 'idle',
  context: ({ input }) => ({
    tasks: input.tasks,
    completed: {},
  }),
  states: {
    idle: {
      on: {
        TOGGLE_TASK: [
          { guard: 'willBeAllDone', target: 'complete', actions: 'toggleTask' },
          { target: 'inProgress', actions: 'toggleTask' },
        ],
        CONTINUE: { target: 'navigatingForward' },
        BACK: { target: 'navigatingBack' },
      },
    },
    inProgress: {
      on: {
        TOGGLE_TASK: [
          { guard: 'willBeAllDone', target: 'complete', actions: 'toggleTask' },
          { guard: 'willBeNoneDone', target: 'idle', actions: 'toggleTask' },
          { actions: 'toggleTask' },
        ],
        CONTINUE: { target: 'navigatingForward' },
        BACK: { target: 'navigatingBack' },
      },
    },
    complete: {
      on: {
        TOGGLE_TASK: [
          { target: 'inProgress', actions: 'toggleTask' },
        ],
        CONTINUE: { target: 'navigatingForward' },
        BACK: { target: 'navigatingBack' },
      },
    },
    navigatingForward: { type: 'final' },
    navigatingBack: { type: 'final' },
  },
})

export { completedCount, allDone }
