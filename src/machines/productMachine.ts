/**
 * @spec specs/components/product-context.md
 * @implements INV-CTX-01 through INV-CTX-06
 *
 * This machine models the ProductContext state transitions.
 * The context itself still uses useState + localStorage effects.
 * This machine is used for unit testing the business logic in isolation.
 */
import { setup, assign } from 'xstate'
import type { StepId, StepStatus, OnboardingSnapshot, SoftwareArchitectureItem } from '../context/ProductContext'

export interface Product {
  id: string
  name: string
  description: string
  softwareItemIds: string[]
  classification: '' | 'Class I' | 'Class IIa' | 'Class IIb' | 'Class III'
  intendedUse: string
  stepProgress: Partial<Record<StepId, StepStatus>>
  stepTaskCompletions: Partial<Record<StepId, Record<string, boolean>>>
  swArchitectureData: SoftwareArchitectureItem[]
  onboardingMode: 'repo' | 'freetext' | 'document' | 'wizard' | null
  onboardingData: OnboardingSnapshot | null
}

export interface SoftwareItem {
  id: string
  name: string
  description: string
  safetyClass: 'A' | 'B' | 'C' | ''
}

export interface ProductMachineContext {
  products: Product[]
  softwareItems: SoftwareItem[]
  activeProductId: string | null
}

export type ProductEvent =
  | { type: 'ADD_PRODUCT'; name: string; description: string; onboardingMode?: Product['onboardingMode']; onboardingData?: OnboardingSnapshot | null }
  | { type: 'ADD_SOFTWARE_ITEM'; name: string; description: string }
  | { type: 'LINK'; productId: string; softwareItemId: string }
  | { type: 'UNLINK'; productId: string; softwareItemId: string }
  | { type: 'SET_ACTIVE'; productId: string | null }
  | { type: 'UPDATE_CLASSIFICATION'; productId: string; classification: Product['classification'] }
  | { type: 'UPDATE_INTENDED_USE'; productId: string; intendedUse: string }
  | { type: 'UPDATE_STEP_PROGRESS'; productId: string; stepId: StepId; status: StepStatus }
  | { type: 'UPDATE_STEP_TASK_COMPLETION'; productId: string; stepId: StepId; taskId: string; value: boolean }
  | { type: 'UPDATE_SW_SAFETY_CLASS'; itemId: string; safetyClass: SoftwareItem['safetyClass'] }
  | { type: 'UPDATE_SW_ARCHITECTURE'; productId: string; items: SoftwareArchitectureItem[] }

const generateId = () => Date.now().toString()

const makeDefaultProduct = (id: string, name: string, description: string, onboardingMode?: Product['onboardingMode'], onboardingData?: OnboardingSnapshot | null): Product => ({
  id,
  name,
  description,
  softwareItemIds: [],
  classification: '',
  intendedUse: '',
  stepProgress: {},
  stepTaskCompletions: {},
  swArchitectureData: [],
  onboardingMode: onboardingMode ?? null,
  onboardingData: onboardingData ?? null,
})

export const productMachine = setup({
  types: {
    context: {} as ProductMachineContext,
    events: {} as ProductEvent,
  },
  guards: {
    hasProducts: ({ context }) => context.products.length > 0,
    noProducts: ({ context }) => context.products.length === 0,
    hasSoftwareItems: ({ context }) => context.softwareItems.length > 0,
    validProductId: ({ context, event }) =>
      event.type === 'SET_ACTIVE' && event.productId !== null
        ? context.products.some(p => p.id === event.productId)
        : true,
    notAlreadyLinked: ({ context, event }) => {
      if (event.type !== 'LINK') return true
      const product = context.products.find(p => p.id === event.productId)
      return product ? !product.softwareItemIds.includes(event.softwareItemId) : false
    },
  },
  actions: {
    addProduct: assign({
      products: ({ context, event }) => {
        if (event.type !== 'ADD_PRODUCT') return context.products
        const id = generateId()
        return [...context.products, makeDefaultProduct(id, event.name, event.description, event.onboardingMode, event.onboardingData)]
      },
      activeProductId: ({ context, event }) => {
        if (event.type !== 'ADD_PRODUCT') return context.activeProductId
        if (context.activeProductId !== null) return context.activeProductId
        return generateId()
      },
    }),
    addSoftwareItem: assign({
      softwareItems: ({ context, event }) => {
        if (event.type !== 'ADD_SOFTWARE_ITEM') return context.softwareItems
        const newItem: SoftwareItem = {
          id: generateId(),
          name: event.name,
          description: event.description,
          safetyClass: '',
        }
        return [...context.softwareItems, newItem]
      },
    }),
    link: assign({
      products: ({ context, event }) => {
        if (event.type !== 'LINK') return context.products
        return context.products.map(p => {
          if (p.id !== event.productId) return p
          if (p.softwareItemIds.includes(event.softwareItemId)) return p
          return { ...p, softwareItemIds: [...p.softwareItemIds, event.softwareItemId] }
        })
      },
    }),
    unlink: assign({
      products: ({ context, event }) => {
        if (event.type !== 'UNLINK') return context.products
        return context.products.map(p => {
          if (p.id !== event.productId) return p
          return { ...p, softwareItemIds: p.softwareItemIds.filter(id => id !== event.softwareItemId) }
        })
      },
    }),
    setActive: assign({
      activeProductId: ({ event }) =>
        event.type === 'SET_ACTIVE' ? event.productId : null,
    }),
    updateClassification: assign({
      products: ({ context, event }) => {
        if (event.type !== 'UPDATE_CLASSIFICATION') return context.products
        return context.products.map(p =>
          p.id === event.productId ? { ...p, classification: event.classification } : p
        )
      },
    }),
    updateIntendedUse: assign({
      products: ({ context, event }) => {
        if (event.type !== 'UPDATE_INTENDED_USE') return context.products
        return context.products.map(p =>
          p.id === event.productId ? { ...p, intendedUse: event.intendedUse } : p
        )
      },
    }),
    updateStepProgress: assign({
      products: ({ context, event }) => {
        if (event.type !== 'UPDATE_STEP_PROGRESS') return context.products
        return context.products.map(p => {
          if (p.id !== event.productId) return p
          return { ...p, stepProgress: { ...p.stepProgress, [event.stepId]: event.status } }
        })
      },
    }),
    updateStepTaskCompletion: assign({
      products: ({ context, event }) => {
        if (event.type !== 'UPDATE_STEP_TASK_COMPLETION') return context.products
        return context.products.map(p => {
          if (p.id !== event.productId) return p
          const stepCompletions = p.stepTaskCompletions[event.stepId] ?? {}
          return {
            ...p,
            stepTaskCompletions: {
              ...p.stepTaskCompletions,
              [event.stepId]: { ...stepCompletions, [event.taskId]: event.value },
            },
          }
        })
      },
    }),
    updateSwSafetyClass: assign({
      softwareItems: ({ context, event }) => {
        if (event.type !== 'UPDATE_SW_SAFETY_CLASS') return context.softwareItems
        return context.softwareItems.map(item =>
          item.id === event.itemId ? { ...item, safetyClass: event.safetyClass } : item
        )
      },
    }),
    updateSwArchitecture: assign({
      products: ({ context, event }) => {
        if (event.type !== 'UPDATE_SW_ARCHITECTURE') return context.products
        return context.products.map(p =>
          p.id === event.productId ? { ...p, swArchitectureData: event.items } : p
        )
      },
    }),
  },
}).createMachine({
  id: 'product',
  initial: 'empty',
  context: {
    products: [],
    softwareItems: [],
    activeProductId: null,
  },
  states: {
    empty: {
      on: {
        ADD_PRODUCT: { target: 'active', actions: 'addProduct' },
        ADD_SOFTWARE_ITEM: { target: 'hasSwOnly', actions: 'addSoftwareItem' },
      },
    },
    hasSwOnly: {
      on: {
        ADD_PRODUCT: { target: 'hasBoth', actions: 'addProduct' },
        ADD_SOFTWARE_ITEM: { actions: 'addSoftwareItem' },
      },
    },
    active: {
      on: {
        ADD_PRODUCT: { actions: 'addProduct' },
        ADD_SOFTWARE_ITEM: { target: 'hasBoth', actions: 'addSoftwareItem' },
        SET_ACTIVE: { actions: 'setActive' },
        LINK: { guard: 'notAlreadyLinked', actions: 'link' },
        UNLINK: { actions: 'unlink' },
        UPDATE_CLASSIFICATION: { actions: 'updateClassification' },
        UPDATE_INTENDED_USE: { actions: 'updateIntendedUse' },
        UPDATE_STEP_PROGRESS: { actions: 'updateStepProgress' },
        UPDATE_STEP_TASK_COMPLETION: { actions: 'updateStepTaskCompletion' },
        UPDATE_SW_SAFETY_CLASS: { actions: 'updateSwSafetyClass' },
        UPDATE_SW_ARCHITECTURE: { actions: 'updateSwArchitecture' },
      },
    },
    hasBoth: {
      on: {
        ADD_PRODUCT: { actions: 'addProduct' },
        ADD_SOFTWARE_ITEM: { actions: 'addSoftwareItem' },
        SET_ACTIVE: { actions: 'setActive' },
        LINK: { guard: 'notAlreadyLinked', actions: 'link' },
        UNLINK: { actions: 'unlink' },
        UPDATE_CLASSIFICATION: { actions: 'updateClassification' },
        UPDATE_INTENDED_USE: { actions: 'updateIntendedUse' },
        UPDATE_STEP_PROGRESS: { actions: 'updateStepProgress' },
        UPDATE_STEP_TASK_COMPLETION: { actions: 'updateStepTaskCompletion' },
        UPDATE_SW_SAFETY_CLASS: { actions: 'updateSwSafetyClass' },
        UPDATE_SW_ARCHITECTURE: { actions: 'updateSwArchitecture' },
      },
    },
  },
})
