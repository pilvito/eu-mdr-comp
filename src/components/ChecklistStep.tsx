import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChecklistStep({ 
  stepNumber, 
  title, 
  description, 
  icon: Icon, 
  tasks, 
  prevStep, 
  nextStep 
}) {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState({});

  const toggleTask = (id) => {
    setCompletedTasks(prev => ({ ...prev, [id]: !prev[id] }));
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
                  <h4 className="heading-md" style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: isDone ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                    {task.title}
                  </h4>
                  <p className="text-small">{task.description}</p>
                </div>
              </div>
            )
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
            {stepNumber === 9 ? 'Finish' : `Continue to Step ${stepNumber + 1}`} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
