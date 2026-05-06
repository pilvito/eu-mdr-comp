/**
 * @spec specs/features/step1-applicability.md
 * @implements INV-STEP1-01, INV-STEP1-02, INV-STEP1-03, INV-STEP1-04, INV-STEP1-05
 * @implements PROG-STEP1-01, PROG-STEP1-02, PROG-STEP1-03
 * @implements REACT-STEP1-01, REACT-STEP1-02
 *
 * Bug fix: spec requires intendedUse.length >= 10 (not > 10 as in Step1.tsx:20).
 */
import { setup, assign } from 'xstate'

export type ClaimKey = 'diagnose' | 'treat' | 'monitor' | 'prevent'
export type ClaimAnswers = Record<ClaimKey, boolean | null>

export interface Step1Context {
  intendedUse: string
  answers: ClaimAnswers
}

export type Step1Event =
  | { type: 'INTENDED_USE_CHANGED'; value: string }
  | { type: 'CLAIM_ANSWERED'; key: ClaimKey; value: boolean }
  | { type: 'CONTINUE' }
  | { type: 'BACK' }

const allAnswered = (answers: ClaimAnswers) =>
  Object.values(answers).every(v => v !== null)

const anyTrue = (answers: ClaimAnswers) =>
  Object.values(answers).some(v => v === true)

const isIntendedUseLong = (use: string) => use.length >= 10

export const step1Machine = setup({
  types: {
    context: {} as Step1Context,
    events: {} as Step1Event,
  },
  guards: {
    // Guards must inspect the incoming event value — XState evaluates guards BEFORE actions run,
    // so context still holds the pre-event state at guard-evaluation time.
    isUseValid: ({ event }) =>
      event.type === 'INTENDED_USE_CHANGED' && isIntendedUseLong(event.value),
    isUseShort: ({ event }) =>
      event.type === 'INTENDED_USE_CHANGED' && !isIntendedUseLong(event.value),
    isComplete: ({ context, event }) => {
      const use = event.type === 'INTENDED_USE_CHANGED' ? event.value : context.intendedUse
      const ans = event.type === 'CLAIM_ANSWERED'
        ? { ...context.answers, [event.key]: event.value }
        : context.answers
      return isIntendedUseLong(use) && allAnswered(ans)
    },
    isMedicalDevice: ({ context, event }) => {
      const ans = event.type === 'CLAIM_ANSWERED'
        ? { ...context.answers, [event.key]: event.value }
        : context.answers
      return anyTrue(ans)
    },
    allAnswered: ({ context, event }) => {
      const ans = event.type === 'CLAIM_ANSWERED'
        ? { ...context.answers, [event.key]: event.value }
        : context.answers
      return allAnswered(ans)
    },
    notAllAnswered: ({ context, event }) => {
      const ans = event.type === 'CLAIM_ANSWERED'
        ? { ...context.answers, [event.key]: event.value }
        : context.answers
      return !allAnswered(ans)
    },
    resultPositive: ({ context, event }) => {
      const use = event.type === 'INTENDED_USE_CHANGED' ? event.value : context.intendedUse
      const ans = event.type === 'CLAIM_ANSWERED'
        ? { ...context.answers, [event.key]: event.value }
        : context.answers
      return isIntendedUseLong(use) && allAnswered(ans) && anyTrue(ans)
    },
    resultNegative: ({ context, event }) => {
      const use = event.type === 'INTENDED_USE_CHANGED' ? event.value : context.intendedUse
      const ans = event.type === 'CLAIM_ANSWERED'
        ? { ...context.answers, [event.key]: event.value }
        : context.answers
      return isIntendedUseLong(use) && allAnswered(ans) && !anyTrue(ans)
    },
  },
  actions: {
    updateIntendedUse: assign({
      intendedUse: ({ event }) =>
        event.type === 'INTENDED_USE_CHANGED' ? event.value : '',
    }),
    updateAnswer: assign({
      answers: ({ context, event }) => {
        if (event.type !== 'CLAIM_ANSWERED') return context.answers
        return { ...context.answers, [event.key]: event.value }
      },
    }),
  },
}).createMachine({
  id: 'step1',
  initial: 'idle',
  context: {
    intendedUse: '',
    answers: { diagnose: null, treat: null, monitor: null, prevent: null },
  },
  states: {
    idle: {
      on: {
        INTENDED_USE_CHANGED: [
          { guard: 'isUseValid', target: 'answering', actions: 'updateIntendedUse' },
          { target: 'filling', actions: 'updateIntendedUse' },
        ],
      },
    },
    filling: {
      on: {
        INTENDED_USE_CHANGED: [
          { guard: 'isUseValid', target: 'answering', actions: 'updateIntendedUse' },
          { actions: 'updateIntendedUse' },
        ],
        BACK: { target: 'idle' },
      },
    },
    answering: {
      on: {
        INTENDED_USE_CHANGED: [
          { guard: 'isUseShort', target: 'filling', actions: 'updateIntendedUse' },
          { actions: 'updateIntendedUse' },
        ],
        CLAIM_ANSWERED: [
          { guard: 'resultPositive', target: 'resultPositive', actions: 'updateAnswer' },
          { guard: 'resultNegative', target: 'resultNegative', actions: 'updateAnswer' },
          { actions: 'updateAnswer' },
        ],
        BACK: { target: 'idle' },
      },
    },
    resultPositive: {
      on: {
        INTENDED_USE_CHANGED: [
          { guard: 'isUseShort', target: 'filling', actions: 'updateIntendedUse' },
          { actions: 'updateIntendedUse' },
        ],
        CLAIM_ANSWERED: [
          { guard: 'resultNegative', target: 'resultNegative', actions: 'updateAnswer' },
          { guard: 'notAllAnswered', target: 'answering', actions: 'updateAnswer' },
          { actions: 'updateAnswer' },
        ],
        CONTINUE: { target: 'done' },
        BACK: { target: 'idle' },
      },
    },
    resultNegative: {
      on: {
        INTENDED_USE_CHANGED: [
          { guard: 'isUseShort', target: 'filling', actions: 'updateIntendedUse' },
          { actions: 'updateIntendedUse' },
        ],
        CLAIM_ANSWERED: [
          { guard: 'resultPositive', target: 'resultPositive', actions: 'updateAnswer' },
          { guard: 'notAllAnswered', target: 'answering', actions: 'updateAnswer' },
          { actions: 'updateAnswer' },
        ],
        BACK: { target: 'idle' },
      },
    },
    done: {
      type: 'final',
    },
  },
})
