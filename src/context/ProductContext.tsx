import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// ── Step tracking types ──────────────────────────────────────────────────────

export type StepId =
  | 'step1' | 'step2' | 'step3' | 'step4' | 'step5'
  | 'step6' | 'step7' | 'step8' | 'step9'
  | 'samd' | 'swarch';

export type StepStatus = 'not_started' | 'in_progress' | 'complete';

// ── Onboarding snapshot ───────────────────────────────────────────────────────

export interface OnboardingSnapshot {
  repoUrl?: string;
  freeText?: string;
  documentName?: string;
  wizardAnswers?: Record<string, string>;
  parsedIntendedUse?: string;
  parsedProductName?: string;
}

// ── Core domain types ─────────────────────────────────────────────────────────

export interface SoftwareItem {
  id: string;
  name: string;
  description: string;
  safetyClass: 'A' | 'B' | 'C' | '';
}

export interface SoftwareArchitectureItem {
  id: string;
  name: string;
  requirements: Array<{ id: string; text: string }>;
  architectureDetails: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  softwareItemIds: string[];
  // Classification & intended use (written back from Step 1 & 2)
  classification: '' | 'Class I' | 'Class IIa' | 'Class IIb' | 'Class III';
  intendedUse: string;
  // Per-step progress tracking
  stepProgress: Partial<Record<StepId, StepStatus>>;
  stepTaskCompletions: Partial<Record<StepId, Record<string, boolean>>>;
  // Software architecture data (written back from SoftwareArchitecture page)
  swArchitectureData: SoftwareArchitectureItem[];
  // Onboarding provenance
  onboardingMode: 'repo' | 'freetext' | 'document' | 'wizard' | null;
  onboardingData: OnboardingSnapshot | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ALL_STEP_IDS: StepId[] = [
  'step1', 'step2', 'step3', 'step4', 'step5',
  'step6', 'step7', 'step8', 'step9', 'samd', 'swarch',
];

function computeOverallProgress(product: Product | null): number {
  if (!product) return 0;
  const complete = ALL_STEP_IDS.filter(
    id => product.stepProgress[id] === 'complete'
  ).length;
  return Math.round((complete / ALL_STEP_IDS.length) * 100);
}

function makeDefaultProduct(
  data: Omit<Product, 'id' | 'softwareItemIds' | 'classification' | 'intendedUse' |
    'stepProgress' | 'stepTaskCompletions' | 'swArchitectureData' |
    'onboardingMode' | 'onboardingData'>
): Omit<Product, 'id'> {
  return {
    ...data,
    softwareItemIds: [],
    classification: '',
    intendedUse: '',
    stepProgress: {},
    stepTaskCompletions: {},
    swArchitectureData: [],
    onboardingMode: null,
    onboardingData: null,
  };
}

// Migrate stored products that may be missing new fields (localStorage schema migration)
function migrateProduct(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: raw.description as string,
    softwareItemIds: (raw.softwareItemIds as string[]) ?? [],
    classification: (raw.classification as Product['classification']) ?? '',
    intendedUse: (raw.intendedUse as string) ?? '',
    stepProgress: (raw.stepProgress as Product['stepProgress']) ?? {},
    stepTaskCompletions: (raw.stepTaskCompletions as Product['stepTaskCompletions']) ?? {},
    swArchitectureData: (raw.swArchitectureData as SoftwareArchitectureItem[]) ?? [],
    onboardingMode: (raw.onboardingMode as Product['onboardingMode']) ?? null,
    onboardingData: (raw.onboardingData as OnboardingSnapshot | null) ?? null,
  };
}

function migrateSoftwareItem(raw: Record<string, unknown>): SoftwareItem {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: raw.description as string,
    safetyClass: (raw.safetyClass as SoftwareItem['safetyClass']) ?? '',
  };
}

// ── Context type ──────────────────────────────────────────────────────────────

interface ProductContextType {
  products: Product[];
  softwareItems: SoftwareItem[];
  activeProductId: string | null;
  overallProgress: number;
  // Derived active product
  activeProduct: Product | null;
  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'softwareItemIds' | 'classification' | 'intendedUse' |
    'stepProgress' | 'stepTaskCompletions' | 'swArchitectureData'>) => void;
  // SoftwareItem CRUD
  addSoftwareItem: (item: Omit<SoftwareItem, 'id'>) => void;
  linkSoftwareItemToProduct: (productId: string, softwareItemId: string) => void;
  unlinkSoftwareItemFromProduct: (productId: string, softwareItemId: string) => void;
  setActiveProduct: (productId: string | null) => void;
  // Step progress
  updateStepProgress: (productId: string, stepId: StepId, status: StepStatus) => void;
  updateStepTaskCompletion: (productId: string, stepId: StepId, taskId: string, value: boolean) => void;
  // Product data write-back
  updateProductClassification: (productId: string, classification: Product['classification']) => void;
  updateProductIntendedUse: (productId: string, intendedUse: string) => void;
  updateSoftwareItemSafetyClass: (itemId: string, safetyClass: SoftwareItem['safetyClass']) => void;
  updateSwArchitectureData: (productId: string, items: SoftwareArchitectureItem[]) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

// ── Provider ──────────────────────────────────────────────────────────────────

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('eumdr_products');
    if (!saved) return [];
    try {
      return (JSON.parse(saved) as Record<string, unknown>[]).map(migrateProduct);
    } catch {
      return [];
    }
  });

  const [softwareItems, setSoftwareItems] = useState<SoftwareItem[]>(() => {
    const saved = localStorage.getItem('eumdr_softwareItems');
    if (!saved) return [];
    try {
      return (JSON.parse(saved) as Record<string, unknown>[]).map(migrateSoftwareItem);
    } catch {
      return [];
    }
  });

  const [activeProductId, setActiveProductId] = useState<string | null>(() => {
    const saved = localStorage.getItem('eumdr_activeProductId');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('eumdr_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('eumdr_softwareItems', JSON.stringify(softwareItems));
  }, [softwareItems]);

  useEffect(() => {
    localStorage.setItem('eumdr_activeProductId', JSON.stringify(activeProductId));
  }, [activeProductId]);

  // Derived values
  const activeProduct = products.find(p => p.id === activeProductId) ?? null;
  const overallProgress = computeOverallProgress(activeProduct);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addProduct = (
    productData: Omit<Product, 'id' | 'softwareItemIds' | 'classification' | 'intendedUse' |
      'stepProgress' | 'stepTaskCompletions' | 'swArchitectureData'>
  ) => {
    const newProduct: Product = {
      ...makeDefaultProduct(productData),
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
    if (!activeProductId) {
      setActiveProductId(newProduct.id);
    }
  };

  const addSoftwareItem = (itemData: Omit<SoftwareItem, 'id'>) => {
    const newItem: SoftwareItem = { ...itemData, id: Date.now().toString() };
    setSoftwareItems(prev => [...prev, newItem]);
  };

  const linkSoftwareItemToProduct = (productId: string, softwareItemId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId && !p.softwareItemIds.includes(softwareItemId)) {
        return { ...p, softwareItemIds: [...p.softwareItemIds, softwareItemId] };
      }
      return p;
    }));
  };

  const unlinkSoftwareItemFromProduct = (productId: string, softwareItemId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, softwareItemIds: p.softwareItemIds.filter(id => id !== softwareItemId) };
      }
      return p;
    }));
  };

  const setActiveProduct = (productId: string | null) => {
    setActiveProductId(productId);
  };

  const updateStepProgress = (productId: string, stepId: StepId, status: StepStatus) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return { ...p, stepProgress: { ...p.stepProgress, [stepId]: status } };
    }));
  };

  const updateStepTaskCompletion = (
    productId: string, stepId: StepId, taskId: string, value: boolean
  ) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const stepCompletions = p.stepTaskCompletions[stepId] ?? {};
      const updated = { ...stepCompletions, [taskId]: value };
      return { ...p, stepTaskCompletions: { ...p.stepTaskCompletions, [stepId]: updated } };
    }));
  };

  const updateProductClassification = (
    productId: string, classification: Product['classification']
  ) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, classification } : p
    ));
  };

  const updateProductIntendedUse = (productId: string, intendedUse: string) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, intendedUse } : p
    ));
  };

  const updateSoftwareItemSafetyClass = (
    itemId: string, safetyClass: SoftwareItem['safetyClass']
  ) => {
    setSoftwareItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, safetyClass } : item
    ));
  };

  const updateSwArchitectureData = (productId: string, items: SoftwareArchitectureItem[]) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, swArchitectureData: items } : p
    ));
  };

  return (
    <ProductContext.Provider value={{
      products,
      softwareItems,
      activeProductId,
      overallProgress,
      activeProduct,
      addProduct,
      addSoftwareItem,
      linkSoftwareItemToProduct,
      unlinkSoftwareItemFromProduct,
      setActiveProduct,
      updateStepProgress,
      updateStepTaskCompletion,
      updateProductClassification,
      updateProductIntendedUse,
      updateSoftwareItemSafetyClass,
      updateSwArchitectureData,
    }}>
      {children}
    </ProductContext.Provider>
  );
};
