import React from 'react';
import { ArrowRight, PlusCircle, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProcessFlow from '../components/ProcessFlow';
import { useProductContext } from '../context/ProductContext';
import type { StepId, StepStatus } from '../context/ProductContext';
import { getNextRecommendedStep, STEP_LABELS } from '../utils/stepDependencies';

function StatusBadge({ status }: { status: StepStatus }) {
  const config = {
    complete: { icon: <CheckCircle2 size={14} />, label: 'Complete', color: 'var(--success)' },
    in_progress: { icon: <AlertCircle size={14} />, label: 'In Progress', color: 'var(--warning)' },
    not_started: { icon: <Circle size={14} />, label: 'Not Started', color: 'var(--text-muted)' },
  } as const;
  const { icon, label, color } = config[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color, fontSize: '0.75rem', fontWeight: 600 }}>
      {icon} {label}
    </span>
  );
}

const CLASS_COLORS: Record<string, string> = {
  'Class I': 'var(--success)',
  'Class IIa': 'var(--info)',
  'Class IIb': 'var(--warning)',
  'Class III': 'var(--danger)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeProduct, overallProgress } = useProductContext();

  const nextStep = activeProduct ? getNextRecommendedStep(activeProduct) : null;
  const completedCount = activeProduct
    ? Object.values(activeProduct.stepProgress).filter(s => s === 'complete').length
    : 0;

  return (
    <div className="animate-fade-in">
      {/* Hero panel */}
      <div className="glass-panel mb-8" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
            <h2 className="heading-lg mb-4" style={{ marginBottom: '1rem' }}>
              {activeProduct ? activeProduct.name : 'Your MDR & SaMD Journey'}
            </h2>

            {activeProduct ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Classification badge */}
                {activeProduct.classification && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="text-small text-muted">Classification:</span>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
                      background: `${CLASS_COLORS[activeProduct.classification] ?? 'var(--primary)'}20`,
                      color: CLASS_COLORS[activeProduct.classification] ?? 'var(--primary)',
                      fontWeight: 700, fontSize: '0.8rem',
                    }}>
                      {activeProduct.classification}
                    </span>
                  </div>
                )}
                {/* Progress summary */}
                <p className="text-body">
                  <strong>{completedCount} of 11</strong> certification steps complete
                  &nbsp;—&nbsp;{overallProgress}% overall
                </p>
                {/* Progress bar */}
                <div className="progress-bar-bg" style={{ maxWidth: 400 }}>
                  <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            ) : (
              <p className="text-body" style={{ maxWidth: '600px' }}>
                A structured roadmap to EU MDR certification and IEC 62304 software compliance.
                Set up a product to track your progress through each step.
              </p>
            )}
          </div>

          {/* CTA */}
          {activeProduct ? (
            nextStep ? (
              <div style={{ textAlign: 'center' }}>
                <p className="text-small text-muted" style={{ marginBottom: '0.5rem' }}>Next recommended</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(nextStep.path)}
                  style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', whiteSpace: 'nowrap' }}
                >
                  {nextStep.label} <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                <p className="text-small" style={{ color: 'var(--success)', fontWeight: 700 }}>All steps complete!</p>
              </div>
            )
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/onboarding')}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', whiteSpace: 'nowrap' }}
            >
              <PlusCircle size={20} /> Get Started
            </button>
          )}
        </div>
      </div>

      {/* Next step card (when product active and next step exists) */}
      {activeProduct && nextStep && (
        <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <p className="text-small text-muted" style={{ marginBottom: '0.2rem' }}>Continue where you left off</p>
            <p className="text-body" style={{ fontWeight: 600 }}>{nextStep.label}</p>
            {nextStep.warning && (
              <p className="text-small" style={{ color: 'var(--warning)', marginTop: '0.2rem' }}>{nextStep.warning}</p>
            )}
          </div>
          <button className="btn btn-secondary" onClick={() => navigate(nextStep.path)}>
            Go <ArrowRight size={16} />
          </button>
        </div>
      )}

      <ProcessFlow />
    </div>
  );
}
