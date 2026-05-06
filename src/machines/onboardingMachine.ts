import { setup, assign } from 'xstate'

export type OnboardingMode = 'repo' | 'freetext' | 'document' | 'wizard'

export const WIZARD_QUESTIONS = [
  { id: 'productName', prompt: 'What is the name of your medical device or software product?' },
  { id: 'intendedUse', prompt: 'Describe what your product is intended to do (its medical purpose).' },
  { id: 'medicalClaims', prompt: 'Does your product diagnose, treat, monitor, or prevent a disease or condition? (e.g. "diagnose, monitor")' },
  { id: 'isSaMD', prompt: 'Is your product primarily software? (yes / no)' },
  { id: 'primaryUsers', prompt: 'Who are the primary users? (e.g. "clinicians", "patients", "lab technicians")' },
] as const

export type WizardQuestionId = (typeof WIZARD_QUESTIONS)[number]['id']

export interface OnboardingContext {
  mode: OnboardingMode | null
  // Repo mode
  repoUrl: string
  repoUrlError: string | null
  // Free-text mode
  freeText: string
  // Document mode
  documentName: string
  documentContent: string
  // Wizard mode
  wizardAnswers: Partial<Record<WizardQuestionId, string>>
  wizardStep: number
  // Preview / confirmed output
  parsedProductName: string
  parsedIntendedUse: string
  parsedDescription: string
}

export type OnboardingEvent =
  | { type: 'SELECT_MODE'; mode: OnboardingMode }
  | { type: 'SET_REPO_URL'; value: string }
  | { type: 'SUBMIT_REPO' }
  | { type: 'SET_TEXT'; value: string }
  | { type: 'SUBMIT_TEXT' }
  | { type: 'FILE_SELECTED'; name: string; content: string }
  | { type: 'SUBMIT_DOCUMENT' }
  | { type: 'ANSWER_WIZARD'; questionId: WizardQuestionId; answer: string }
  | { type: 'NEXT_WIZARD_STEP' }
  | { type: 'SUBMIT_WIZARD' }
  | { type: 'SET_PREVIEW_FIELD'; field: 'parsedProductName' | 'parsedIntendedUse' | 'parsedDescription'; value: string }
  | { type: 'CONFIRM' }
  | { type: 'BACK' }

const REPO_URL_RE = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/.+/i

function slugToName(url: string): string {
  try {
    const parts = new URL(url).pathname.replace(/^\//, '').split('/')
    const repo = parts[1] ?? parts[0] ?? 'My Product'
    return repo.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  } catch {
    return 'My Product'
  }
}

function deriveFromWizard(answers: Partial<Record<WizardQuestionId, string>>): {
  name: string; intendedUse: string; description: string
} {
  const name = answers.productName?.trim() || 'My Product'
  const intendedUse = answers.intendedUse?.trim() || ''
  const isSaMD = (answers.isSaMD ?? '').toLowerCase().startsWith('y')
  const users = answers.primaryUsers?.trim() || 'healthcare professionals'
  const claims = answers.medicalClaims?.trim() || ''
  const description = [
    isSaMD ? 'Software as a Medical Device (SaMD).' : 'Medical device.',
    claims ? `Medical claims: ${claims}.` : '',
    `Primary users: ${users}.`,
  ].filter(Boolean).join(' ')
  return { name, intendedUse, description }
}

export const onboardingMachine = setup({
  types: {
    context: {} as OnboardingContext,
    events: {} as OnboardingEvent,
  },
  guards: {
    repoUrlValid: ({ context }) => REPO_URL_RE.test(context.repoUrl.trim()),
    freeTextLong: ({ context }) => context.freeText.trim().length >= 20,
    fileSelected: ({ context }) => context.documentName.length > 0,
    allWizardAnswered: ({ context }) => {
      const required: WizardQuestionId[] = ['productName', 'intendedUse']
      return required.every(id => (context.wizardAnswers[id] ?? '').trim().length > 0)
    },
    notLastWizardStep: ({ context }) => context.wizardStep < WIZARD_QUESTIONS.length - 1,
    isLastWizardStep: ({ context }) => context.wizardStep >= WIZARD_QUESTIONS.length - 1,
  },
  actions: {
    setMode: assign({
      mode: ({ event }) => event.type === 'SELECT_MODE' ? event.mode : null,
    }),
    setRepoUrl: assign({
      repoUrl: ({ event }) => event.type === 'SET_REPO_URL' ? event.value : '',
      repoUrlError: () => null,
    }),
    parseRepoUrl: assign({
      parsedProductName: ({ context }) => slugToName(context.repoUrl),
      parsedIntendedUse: () => '',
      parsedDescription: ({ context }) => `Source repository: ${context.repoUrl}`,
      repoUrlError: () => null,
    }),
    setRepoUrlError: assign({
      repoUrlError: () => 'Please enter a valid GitHub, GitLab, or Bitbucket URL.',
    }),
    setText: assign({
      freeText: ({ event }) => event.type === 'SET_TEXT' ? event.value : '',
    }),
    parseText: assign({
      parsedProductName: ({ context }) => {
        const firstLine = context.freeText.trim().split('\n')[0] ?? ''
        return firstLine.slice(0, 60) || 'My Product'
      },
      parsedIntendedUse: ({ context }) => context.freeText.trim().slice(0, 200),
      parsedDescription: ({ context }) => context.freeText.trim(),
    }),
    setFile: assign({
      documentName: ({ event }) => event.type === 'FILE_SELECTED' ? event.name : '',
      documentContent: ({ event }) => event.type === 'FILE_SELECTED' ? event.content : '',
    }),
    parseDocument: assign({
      parsedProductName: ({ context }) => {
        const base = context.documentName.replace(/\.[^/.]+$/, '')
        return base.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      },
      parsedIntendedUse: ({ context }) => context.documentContent.trim().slice(0, 200),
      parsedDescription: ({ context }) => `Imported from document: ${context.documentName}`,
    }),
    answerWizard: assign({
      wizardAnswers: ({ context, event }) => {
        if (event.type !== 'ANSWER_WIZARD') return context.wizardAnswers
        return { ...context.wizardAnswers, [event.questionId]: event.answer }
      },
    }),
    advanceWizardStep: assign({
      wizardStep: ({ context }) => context.wizardStep + 1,
    }),
    parseWizard: assign({
      parsedProductName: ({ context }) => deriveFromWizard(context.wizardAnswers).name,
      parsedIntendedUse: ({ context }) => deriveFromWizard(context.wizardAnswers).intendedUse,
      parsedDescription: ({ context }) => deriveFromWizard(context.wizardAnswers).description,
    }),
    setPreviewField: assign({
      parsedProductName: ({ context, event }) =>
        event.type === 'SET_PREVIEW_FIELD' && event.field === 'parsedProductName'
          ? event.value : context.parsedProductName,
      parsedIntendedUse: ({ context, event }) =>
        event.type === 'SET_PREVIEW_FIELD' && event.field === 'parsedIntendedUse'
          ? event.value : context.parsedIntendedUse,
      parsedDescription: ({ context, event }) =>
        event.type === 'SET_PREVIEW_FIELD' && event.field === 'parsedDescription'
          ? event.value : context.parsedDescription,
    }),
    resetToModeSelect: assign({
      mode: () => null as OnboardingMode | null,
      repoUrl: () => '',
      repoUrlError: () => null,
      freeText: () => '',
      documentName: () => '',
      documentContent: () => '',
      wizardAnswers: () => ({} as Partial<Record<WizardQuestionId, string>>),
      wizardStep: () => 0,
    }),
  },
}).createMachine({
  id: 'onboarding',
  initial: 'modeSelect',
  context: {
    mode: null,
    repoUrl: '',
    repoUrlError: null,
    freeText: '',
    documentName: '',
    documentContent: '',
    wizardAnswers: {},
    wizardStep: 0,
    parsedProductName: '',
    parsedIntendedUse: '',
    parsedDescription: '',
  },
  states: {
    modeSelect: {
      on: {
        SELECT_MODE: [
          { guard: ({ event }) => event.mode === 'repo', target: 'repoEntry', actions: 'setMode' },
          { guard: ({ event }) => event.mode === 'freetext', target: 'freetextEntry', actions: 'setMode' },
          { guard: ({ event }) => event.mode === 'document', target: 'documentUpload', actions: 'setMode' },
          { guard: ({ event }) => event.mode === 'wizard', target: 'wizardQA', actions: 'setMode' },
        ],
      },
    },

    repoEntry: {
      on: {
        SET_REPO_URL: { actions: 'setRepoUrl' },
        SUBMIT_REPO: [
          { guard: 'repoUrlValid', target: 'previewing', actions: 'parseRepoUrl' },
          { actions: 'setRepoUrlError' },
        ],
        BACK: { target: 'modeSelect', actions: 'resetToModeSelect' },
      },
    },

    freetextEntry: {
      on: {
        SET_TEXT: { actions: 'setText' },
        SUBMIT_TEXT: [
          { guard: 'freeTextLong', target: 'previewing', actions: 'parseText' },
        ],
        BACK: { target: 'modeSelect', actions: 'resetToModeSelect' },
      },
    },

    documentUpload: {
      on: {
        FILE_SELECTED: { actions: 'setFile' },
        SUBMIT_DOCUMENT: [
          { guard: 'fileSelected', target: 'previewing', actions: 'parseDocument' },
        ],
        BACK: { target: 'modeSelect', actions: 'resetToModeSelect' },
      },
    },

    wizardQA: {
      on: {
        ANSWER_WIZARD: { actions: 'answerWizard' },
        NEXT_WIZARD_STEP: [
          { guard: 'notLastWizardStep', actions: 'advanceWizardStep' },
        ],
        SUBMIT_WIZARD: [
          { guard: 'allWizardAnswered', target: 'previewing', actions: 'parseWizard' },
        ],
        BACK: { target: 'modeSelect', actions: 'resetToModeSelect' },
      },
    },

    previewing: {
      on: {
        SET_PREVIEW_FIELD: { actions: 'setPreviewField' },
        CONFIRM: { target: 'confirmed' },
        BACK: { target: 'modeSelect', actions: 'resetToModeSelect' },
      },
    },

    confirmed: {
      type: 'final',
    },
  },
})
