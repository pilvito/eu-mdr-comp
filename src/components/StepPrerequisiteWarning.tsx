import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { StepId } from '../context/ProductContext';
import { useProductContext } from '../context/ProductContext';
import { getStepWarning } from '../utils/stepDependencies';

interface StepPrerequisiteWarningProps {
  stepId: StepId;
}

export default function StepPrerequisiteWarning({ stepId }: StepPrerequisiteWarningProps) {
  const { activeProduct } = useProductContext();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const warning = getStepWarning(stepId, activeProduct);
  if (!warning) return null;

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        marginBottom: '1.5rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
      }}
    >
      <AlertTriangle size={18} color="var(--warning)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
      <p className="text-small" style={{ flex: 1, color: 'var(--text-primary)', margin: 0 }}>
        <strong style={{ color: 'var(--warning)' }}>Recommended prerequisite: </strong>
        {warning}
      </p>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', padding: 0, flexShrink: 0,
        }}
        aria-label="Dismiss warning"
      >
        <X size={16} />
      </button>
    </div>
  );
}
