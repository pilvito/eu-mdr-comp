/**
 * @spec specs/features/iec62304-sw-architecture.md
 * @implements INV-ARCH-01, INV-ARCH-02, INV-ARCH-03, INV-ARCH-04, INV-ARCH-05, INV-ARCH-06, INV-ARCH-07, INV-ARCH-08
 * @implements PROG-ARCH-01, PROG-ARCH-02, PROG-ARCH-03
 * @implements REACT-ARCH-01 through REACT-ARCH-05
 */
import { setup, assign } from 'xstate'

export interface Requirement {
  id: string
  text: string
}

export interface SoftwareItem {
  id: string
  name: string
  requirements: Requirement[]
  architectureDetails: string
}

export type ActiveTab = 'requirements' | 'architecture'

export interface ArchContext {
  items: SoftwareItem[]
  activeItemId: string | null
  activeTab: ActiveTab
  savedStatus: boolean
  newItemName: string
  newRequirement: string
}

export type ArchEvent =
  | { type: 'SELECT_ITEM'; id: string }
  | { type: 'ADD_ITEM'; name: string }
  | { type: 'SWITCH_TAB'; tab: ActiveTab }
  | { type: 'ADD_REQUIREMENT'; text: string }
  | { type: 'UPDATE_ARCHITECTURE'; value: string }
  | { type: 'SAVE' }
  | { type: 'SAVE_TIMEOUT' }

const DEMO_ITEM: SoftwareItem = {
  id: 'demo-item-1',
  name: 'EHR Core Database',
  requirements: [{ id: 'r1', text: 'Must support 10,000 concurrent patient record fetches.' }],
  architectureDetails: 'PostgreSQL hosted on AWS RDS. Multi-AZ deployment for high availability.',
}

export const swArchitectureMachine = setup({
  types: {
    context: {} as ArchContext,
    events: {} as ArchEvent,
  },
  guards: {
    hasActiveItem: ({ context }) => context.activeItemId !== null,
    nameNotEmpty: ({ event }) => event.type === 'ADD_ITEM' && event.name.trim().length > 0,
    reqNotEmpty: ({ event }) => event.type === 'ADD_REQUIREMENT' && event.text.trim().length > 0,
  },
  actions: {
    selectItem: assign({
      activeItemId: ({ event }) => event.type === 'SELECT_ITEM' ? event.id : null,
    }),
    addItem: assign({
      items: ({ context, event }) => {
        if (event.type !== 'ADD_ITEM' || !event.name.trim()) return context.items
        const newItem: SoftwareItem = {
          id: `item-${Date.now()}`,
          name: event.name,
          requirements: [],
          architectureDetails: '',
        }
        return [...context.items, newItem]
      },
      activeItemId: ({ context, event }) => {
        if (event.type !== 'ADD_ITEM' || !event.name.trim()) return context.activeItemId
        return `item-${Date.now()}`
      },
    }),
    switchTab: assign({
      activeTab: ({ event }) => event.type === 'SWITCH_TAB' ? event.tab : 'requirements',
    }),
    addRequirement: assign({
      items: ({ context, event }) => {
        if (event.type !== 'ADD_REQUIREMENT' || !event.text.trim() || !context.activeItemId) return context.items
        return context.items.map(item => {
          if (item.id !== context.activeItemId) return item
          return {
            ...item,
            requirements: [
              ...item.requirements,
              { id: `req-${Date.now()}`, text: event.text },
            ],
          }
        })
      },
    }),
    updateArchitecture: assign({
      items: ({ context, event }) => {
        if (event.type !== 'UPDATE_ARCHITECTURE' || !context.activeItemId) return context.items
        return context.items.map(item =>
          item.id === context.activeItemId ? { ...item, architectureDetails: event.value } : item,
        )
      },
    }),
    setSaved: assign({ savedStatus: true }),
    clearSaved: assign({ savedStatus: false }),
  },
}).createMachine({
  id: 'swArchitecture',
  initial: 'editing',
  context: {
    items: [DEMO_ITEM],
    activeItemId: 'demo-item-1',
    activeTab: 'requirements',
    savedStatus: false,
    newItemName: '',
    newRequirement: '',
  },
  states: {
    editing: {
      on: {
        SELECT_ITEM: { actions: 'selectItem' },
        ADD_ITEM: { guard: 'nameNotEmpty', actions: 'addItem' },
        SWITCH_TAB: { actions: 'switchTab' },
        ADD_REQUIREMENT: { guard: 'reqNotEmpty', actions: 'addRequirement' },
        UPDATE_ARCHITECTURE: { actions: 'updateArchitecture' },
        SAVE: { target: 'saving', actions: 'setSaved' },
      },
    },
    saving: {
      after: {
        2000: { target: 'editing', actions: 'clearSaved' },
      },
      on: {
        SAVE_TIMEOUT: { target: 'editing', actions: 'clearSaved' },
      },
    },
  },
})
