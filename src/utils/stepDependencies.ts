import type { StepId, StepStatus, Product } from '../context/ProductContext';

export interface StepDependency {
  stepId: StepId;
  requiredStepId: StepId;
  warningMessage: string;
}

export const STEP_DEPENDENCIES: StepDependency[] = [
  {
    stepId: 'step2',
    requiredStepId: 'step1',
    warningMessage: 'Step 1 (Applicability Check) should be completed first to accurately classify your device.',
  },
  {
    stepId: 'step3',
    requiredStepId: 'step2',
    warningMessage: 'Device classification (Step 2) is recommended before building your QMS.',
  },
  {
    stepId: 'step4',
    requiredStepId: 'step3',
    warningMessage: 'QMS planning (Step 3) is recommended before generating clinical evidence.',
  },
  {
    stepId: 'step5',
    requiredStepId: 'step4',
    warningMessage: 'Clinical data (Step 4) is recommended before preparing the technical file.',
  },
  {
    stepId: 'step6',
    requiredStepId: 'step5',
    warningMessage: 'Technical documentation (Step 5) should be ready before engaging a Notified Body.',
  },
  {
    stepId: 'step7',
    requiredStepId: 'step2',
    warningMessage: 'Device classification (Step 2) is needed to determine EU-specific requirements.',
  },
  {
    stepId: 'step8',
    requiredStepId: 'step6',
    warningMessage: 'Notified Body audit (Step 6) must be complete before CE marking (for Class IIa+).',
  },
  {
    stepId: 'step9',
    requiredStepId: 'step8',
    warningMessage: 'CE marking (Step 8) should be achieved before starting post-market surveillance tracking.',
  },
  {
    stepId: 'samd',
    requiredStepId: 'step3',
    warningMessage: 'QMS planning (Step 3) is recommended before IEC 62304 software development planning.',
  },
  {
    stepId: 'swarch',
    requiredStepId: 'samd',
    warningMessage: 'IEC 62304 Planning should be completed before defining software architecture.',
  },
];

// Human-readable labels and paths for each step (used in Dashboard + warnings)
export const STEP_META: Record<StepId, { label: string; path: string }> = {
  step1: { label: '1. Applicability Check', path: '/step-1' },
  step2: { label: '2. Device Classification', path: '/step-2' },
  step3: { label: '3. QMS Builder', path: '/step-3' },
  step4: { label: '4. Clinical Data', path: '/step-4' },
  step5: { label: '5. Technical File', path: '/step-5' },
  step6: { label: '6. Notified Body', path: '/step-6' },
  step7: { label: '7. EU Requirements', path: '/step-7' },
  step8: { label: '8. CE Marking', path: '/step-8' },
  step9: { label: '9. Post-Market Surveillance', path: '/step-9' },
  samd: { label: 'IEC 62304 Planning', path: '/sw-planning' },
  swarch: { label: 'Software Architecture', path: '/sw-architecture' },
};

// Re-export just the labels map (backward compat with Dashboard import)
export const STEP_LABELS = STEP_META;

// Ordered list for recommended-next logic
const RECOMMENDED_ORDER: StepId[] = [
  'step1', 'step2', 'step3', 'samd', 'swarch',
  'step4', 'step5', 'step6', 'step7', 'step8', 'step9',
];

/**
 * Returns the warning message for a step if its prerequisite is not complete.
 * Returns null if prerequisites are met or if there is no active product.
 */
export function getStepWarning(stepId: StepId, product: Product | null): string | null {
  if (!product) return null;
  const deps = STEP_DEPENDENCIES.filter(d => d.stepId === stepId);
  for (const dep of deps) {
    const requiredStatus: StepStatus | undefined = product.stepProgress[dep.requiredStepId];
    if (requiredStatus !== 'complete') {
      return dep.warningMessage;
    }
  }
  return null;
}

/**
 * Returns all prerequisite step IDs that are not yet complete for a given step.
 */
export function getMissingPrerequisites(stepId: StepId, product: Product): StepId[] {
  return STEP_DEPENDENCIES
    .filter(d => d.stepId === stepId)
    .filter(d => product.stepProgress[d.requiredStepId] !== 'complete')
    .map(d => d.requiredStepId);
}

/**
 * Returns the next recommended step (first not_started step in recommended order
 * whose prerequisites are all complete, or the first incomplete step if none qualify).
 */
export function getNextRecommendedStep(
  product: Product
): { stepId: StepId; label: string; path: string; warning: string | null } | null {
  // First pass: find the first not_started step with all prerequisites met
  for (const stepId of RECOMMENDED_ORDER) {
    const status = product.stepProgress[stepId] ?? 'not_started';
    if (status === 'complete') continue;
    const missing = getMissingPrerequisites(stepId, product);
    if (missing.length === 0) {
      return {
        stepId,
        label: STEP_META[stepId].label,
        path: STEP_META[stepId].path,
        warning: null,
      };
    }
  }
  // Second pass: first in_progress step
  for (const stepId of RECOMMENDED_ORDER) {
    const status = product.stepProgress[stepId];
    if (status === 'in_progress') {
      return {
        stepId,
        label: STEP_META[stepId].label,
        path: STEP_META[stepId].path,
        warning: getStepWarning(stepId, product),
      };
    }
  }
  return null;
}
