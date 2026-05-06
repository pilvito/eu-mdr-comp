import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import type { StepId } from '../context/ProductContext';

// Calling useProductContext() inside try-catch is safe: the hook always runs
// unconditionally, and the throw it emits is a plain JS error (not a React
// render error). When tests render ChecklistStep without a ProductProvider,
// the catch branch returns null and the component operates in local-only mode.
function useSafeProductContext() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useProductContext();
  } catch {
    return null;
  }
}

export interface Task {
  id: string;
  title: string;
  description: string;
}

interface ChecklistStepProps {
  stepNumber: number | string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string; opacity?: number }>;
  tasks: Task[];
  prevStep: string;
  nextStep: string;
  /** Step ID used to persist progress to ProductContext. Omit (or leave undefined) to run in local-only mode. */
  stepId?: StepId;
}

export default function ChecklistStep({
  stepNumber,
  title,
  description,
  icon: Icon,
  tasks,
  prevStep,
  nextStep,
  stepId,
}: ChecklistStepProps) {
  const navigate = useNavigate();
  const ctx = useSafeProductContext();
  const activeProductId = ctx?.activeProductId ?? null;

  // Determine initial completions: restore from context when stepId + product available,
  // otherwise start empty (local-only mode preserves existing test behaviour).
  const getInitialCompletions = (): Record<string, boolean> => {
    if (stepId && stepId !== 'step-unknown' && ctx?.activeProduct) {
      return ctx.activeProduct.stepTaskCompletions[stepId] ?? {};
    }
    return {};
  };

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(getInitialCompletions);

  // Re-sync when active product changes (e.g. user switches product in header)
  useEffect(() => {
    setCompletedTasks(getInitialCompletions());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProductId, stepId]);

  const toggleTask = (id: string) => {
    const newValue = !completedTasks[id];
    const updated = { ...completedTasks, [id]: newValue };
    setCompletedTasks(updated);

    // Persist to context if in connected mode
    if (stepId && stepId !== 'step-unknown' && activeProductId && ctx) {
      ctx.updateStepTaskCompletion(activeProductId, stepId, id, newValue);

      // Derive step status
      const completedCount = Object.values(updated).filter(Boolean).length;
      const status =
        completedCount === 0 ? 'not_started'
        : completedCount === tasks.length ? 'complete'
        : 'in_progress';
      ctx.updateStepProgress(activeProductId, stepId, status);
    }
  };

  const completedCount = Object.values(completedTasks).filter(v => v).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate(prevStep)}
        style={{ marginBottom: '2rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h2 className="heading-lg mb-2">Step {stepNumber}: {title}</h2>
            <p className="text-body max-w-2xl">{description}</p>
          </div>
          <Icon size={48} color="var(--primary)" opacity={0.5} />
        </div>

        <div className="progress-container mb-8" style={{ marginBottom: '2rem' }}>
          <div className="flex-between mb-2">
            <span className="text-small">Completion Progress</span>
            <span className="text-small" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{progress}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px' }}>
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="task-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
          {tasks.map(task => {
            const isDone = completedTasks[task.id];
            return (
              <div
                key={task.id}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  cursor: 'pointer',
                  border: isDone ? '1px solid var(--success)' : '1px solid var(--border-subtle)',
                  background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)'
                }}
                onClick={() => toggleTask(task.id)}
              >
                <div style={{ marginTop: '0.25rem' }}>
                  {isDone ? <CheckCircle2 size={24} color="var(--success)" /> : <Circle size={24} color="var(--text-muted)" />}
                </div>
                <div>
                  <h4 className="heading-md" style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                    {task.title}
                  </h4>
                  <p className="text-small">{task.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-between">
          <span className="text-small text-muted">
            {completedCount} of {tasks.length} tasks completed
          </span>
          <button
            className="btn btn-primary"
            onClick={() => navigate(nextStep)}
          >
            {stepNumber === 9 ? 'Finish' : typeof stepNumber === 'number' ? `Continue to Step ${stepNumber + 1}` : 'Continue'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
