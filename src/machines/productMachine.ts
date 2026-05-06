/**
 * @spec specs/components/product-context.md
 * @implements INV-CTX-01, INV-CTX-02, INV-CTX-03, INV-CTX-04, INV-CTX-05, INV-CTX-06
 * @implements PROG-CTX-01, PROG-CTX-02
 * @implements REACT-CTX-01, REACT-CTX-02, REACT-CTX-03
 *
 * This machine models the ProductContext state transitions.
 * The context itself still uses useState + localStorage effects (REACT-CTX-05 invariant).
 * This machine is used for unit testing the business logic in isolation.
 */
import { setup, assign } from 'xstate'

export interface Product {
  id: string
  name: string
  description: string
  softwareItemIds: string[]
}

export interface SoftwareItem {
  id: string
  name: string
  description: string
}

export interface ProductContext {
  products: Product[]
  softwareItems: SoftwareItem[]
  activeProductId: string | null
}

export type ProductEvent =
  | { type: 'ADD_PRODUCT'; name: string; description: string }
  | { type: 'ADD_SOFTWARE_ITEM'; name: string; description: string }
  | { type: 'LINK'; productId: string; softwareItemId: string }
  | { type: 'UNLINK'; productId: string; softwareItemId: string }
  | { type: 'SET_ACTIVE'; productId: string | null }

const generateId = () => Date.now().toString()

export const productMachine = setup({
  types: {
    context: {} as ProductContext,
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
        const newProduct: Product = {
          id: generateId(),
          name: event.name,
          description: event.description,
          softwareItemIds: [],
        }
        return [...context.products, newProduct]
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
      },
    },
    hasBoth: {
      on: {
        ADD_PRODUCT: { actions: 'addProduct' },
        ADD_SOFTWARE_ITEM: { actions: 'addSoftwareItem' },
        SET_ACTIVE: { actions: 'setActive' },
        LINK: { guard: 'notAlreadyLinked', actions: 'link' },
        UNLINK: { actions: 'unlink' },
      },
    },
  },
})
