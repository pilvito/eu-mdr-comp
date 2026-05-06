/**
 * @spec specs/features/step2-classification.md
 * @implements INV-STEP2-01, INV-STEP2-02, INV-STEP2-03, INV-STEP2-04, INV-STEP2-05, INV-STEP2-06
 * @implements PROG-STEP2-01, PROG-STEP2-02
 * @implements REACT-STEP2-01 through REACT-STEP2-06
 *
 * Simplified classification logic per MVP (not full Annex VIII).
 */
import { setup, assign } from 'xstate'

export type Duration = 'transient' | 'short-term' | 'long-term' | ''
export type RiskClass = 'Class I' | 'Class IIa' | 'Class IIb' | 'Class III'

export interface ClassificationResult {
  class: RiskClass
  desc: string
  color: string
}

export interface Step2Context {
  invasive: boolean | null
  active: boolean | null
  duration: Duration
}

export type Step2Event =
  | { type: 'SET_INVASIVE'; value: boolean }
  | { type: 'SET_ACTIVE'; value: boolean }
  | { type: 'SET_DURATION'; value: Duration }
  | { type: 'CONTINUE' }
  | { type: 'BACK' }

const computeClass = (ctx: Step2Context): ClassificationResult | null => {
  const { invasive, active, duration } = ctx
  if (invasive === null || active === null || !duration) return null
  if (invasive && duration === 'long-term')
    return { class: 'Class III', desc: 'Highest risk. Requires Notified Body audit for QMS and clinical data.', color: 'var(--danger)' }
  if (active && duration === 'short-term')
    return { class: 'Class IIb', desc: 'Medium-high risk. Requires Notified Body involvement.', color: 'var(--warning)' }
  if (!invasive && !active)
    return { class: 'Class I', desc: 'Low risk. Self-certification possible (unless measuring/sterile/reusable).', color: 'var(--success)' }
  return { class: 'Class IIa', desc: 'Medium risk. Requires Notified Body assessment.', color: 'var(--info)' }
}

const isComplete = (ctx: Step2Context) => computeClass(ctx) !== null

export const step2Machine = setup({
  types: {
    context: {} as Step2Context,
    events: {} as Step2Event,
  },
  guards: {
    // Guards must project the event onto context — XState evaluates guards BEFORE actions run.
    isComplete: ({ context, event }) => {
      const invasive = event.type === 'SET_INVASIVE' ? event.value : context.invasive
      const active = event.type === 'SET_ACTIVE' ? event.value : context.active
      const duration = event.type === 'SET_DURATION' ? event.value : context.duration
      return computeClass({ invasive, active, duration }) !== null
    },
    notComplete: ({ context, event }) => {
      const invasive = event.type === 'SET_INVASIVE' ? event.value : context.invasive
      const active = event.type === 'SET_ACTIVE' ? event.value : context.active
      const duration = event.type === 'SET_DURATION' ? event.value : context.duration
      return computeClass({ invasive, active, duration }) === null
    },
  },
  actions: {
    setInvasive: assign({
      invasive: ({ event }) => event.type === 'SET_INVASIVE' ? event.value : null,
    }),
    setActive: assign({
      active: ({ event }) => event.type === 'SET_ACTIVE' ? event.value : null,
    }),
    setDuration: assign({
      duration: ({ event }) => event.type === 'SET_DURATION' ? event.value : '',
    }),
  },
}).createMachine({
  id: 'step2',
  initial: 'configuring',
  context: {
    invasive: null,
    active: null,
    duration: '',
  },
  states: {
    configuring: {
      on: {
        SET_INVASIVE: [
          { guard: 'isComplete', target: 'result', actions: 'setInvasive' },
          { actions: 'setInvasive' },
        ],
        SET_ACTIVE: [
          { guard: 'isComplete', target: 'result', actions: 'setActive' },
          { actions: 'setActive' },
        ],
        SET_DURATION: [
          { guard: 'isComplete', target: 'result', actions: 'setDuration' },
          { actions: 'setDuration' },
        ],
        BACK: { target: 'back' },
      },
    },
    result: {
      on: {
        SET_INVASIVE: { actions: 'setInvasive' },
        SET_ACTIVE: { actions: 'setActive' },
        SET_DURATION: { actions: 'setDuration' },
        CONTINUE: { target: 'done' },
        BACK: { target: 'back' },
      },
    },
    done: { type: 'final' },
    back: { type: 'final' },
  },
})

export { computeClass }
