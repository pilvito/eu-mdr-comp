import React, { useRef } from 'react';
import { useMachine } from '@xstate/react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, FileText, AlignLeft, HelpCircle, ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { onboardingMachine, WIZARD_QUESTIONS } from '../machines/onboardingMachine';
import type { OnboardingMode } from '../machines/onboardingMachine';
import { useProductContext } from '../context/ProductContext';

// ── Mode card config ──────────────────────────────────────────────────────────

const MODE_CARDS: Array<{
  mode: OnboardingMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = [
  {
    mode: 'repo',
    icon: <GitBranch size={32} />,
    title: 'Source Repository',
    description: 'Point to an existing GitHub, GitLab, or Bitbucket repo.',
    color: 'var(--info)',
  },
  {
    mode: 'freetext',
    icon: <AlignLeft size={32} />,
    title: 'Text Description',
    description: 'Paste or type a description of your product and its purpose.',
    color: 'var(--success)',
  },
  {
    mode: 'document',
    icon: <FileText size={32} />,
    title: 'Upload Document',
    description: 'Upload a spec, SRS, or design document (PDF, Markdown, TXT).',
    color: 'var(--warning)',
  },
  {
    mode: 'wizard',
    icon: <HelpCircle size={32} />,
    title: 'Guided Q&A',
    description: 'Answer 5 short questions to set up your product profile.',
    color: 'var(--primary)',
  },
];

// ── Step indicator ────────────────────────────────────────────────────────────

const STEP_LABELS = ['Choose Start', 'Provide Info', 'Review & Confirm'];

function StepIndicator({ currentStep }: { currentStep: 0 | 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
      {STEP_LABELS.map((label, idx) => (
        <React.Fragment key={label}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            opacity: idx <= currentStep ? 1 : 0.4,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: idx < currentStep ? 'var(--success)' : idx === currentStep ? 'var(--primary)' : 'var(--border-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: 'white',
            }}>
              {idx < currentStep ? <Check size={14} /> : idx + 1}
            </div>
            <span className="text-small" style={{ fontWeight: idx === currentStep ? 600 : 400 }}>{label}</span>
          </div>
          {idx < STEP_LABELS.length - 1 && (
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)', minWidth: 24 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { addProduct } = useProductContext();
  const [state, send] = useMachine(onboardingMachine);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stateValue = state.value as string;
  const ctx = state.context;

  const indicatorStep: 0 | 1 | 2 =
    stateValue === 'modeSelect' ? 0
    : stateValue === 'previewing' || stateValue === 'confirmed' ? 2
    : 1;

  // When machine reaches confirmed, create the product and redirect
  React.useEffect(() => {
    if (stateValue === 'confirmed') {
      addProduct({
        name: ctx.parsedProductName || 'My Product',
        description: ctx.parsedDescription,
        intendedUse: ctx.parsedIntendedUse,
        onboardingMode: ctx.mode,
        onboardingData: {
          repoUrl: ctx.repoUrl || undefined,
          freeText: ctx.freeText || undefined,
          documentName: ctx.documentName || undefined,
          wizardAnswers: Object.keys(ctx.wizardAnswers).length > 0 ? ctx.wizardAnswers : undefined,
          parsedIntendedUse: ctx.parsedIntendedUse || undefined,
          parsedProductName: ctx.parsedProductName || undefined,
        },
      });
      navigate('/step-1');
    }
  }, [stateValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      send({ type: 'FILE_SELECTED', name: file.name, content: ev.target?.result as string ?? '' });
    };
    reader.readAsText(file);
  };

  // ── Render each state ─────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in" style={{ maxWidth: 760, margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 className="heading-lg" style={{ marginBottom: '0.5rem' }}>Start Your Certification Journey</h2>
        <p className="text-body text-muted" style={{ marginBottom: '2rem' }}>
          Tell us about your product so we can guide you through EU MDR certification step by step.
        </p>

        <StepIndicator currentStep={indicatorStep} />

        {/* ── STEP 0: Mode selection ── */}
        {stateValue === 'modeSelect' && (
          <div className="grid-cols-2" style={{ gap: '1rem' }}>
            {MODE_CARDS.map(card => (
              <div
                key={card.mode}
                className="glass-card"
                onClick={() => send({ type: 'SELECT_MODE', mode: card.mode })}
                style={{
                  padding: '1.5rem', cursor: 'pointer',
                  border: '2px solid var(--border-subtle)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = card.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ color: card.color, marginBottom: '0.75rem' }}>{card.icon}</div>
                <h4 className="heading-md" style={{ marginBottom: '0.5rem' }}>{card.title}</h4>
                <p className="text-small text-muted">{card.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1a: Repo entry ── */}
        {stateValue === 'repoEntry' && (
          <div>
            <button className="btn btn-secondary" onClick={() => send({ type: 'BACK' })} style={{ marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Source Repository URL</h3>
            <p className="text-small text-muted" style={{ marginBottom: '1.5rem' }}>
              Enter a GitHub, GitLab, or Bitbucket repository URL. We'll use it to set up your product profile.
            </p>
            <input
              type="url"
              className="glass-card"
              placeholder="https://github.com/your-org/your-repo"
              value={ctx.repoUrl}
              onChange={e => send({ type: 'SET_REPO_URL', value: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && send({ type: 'SUBMIT_REPO' })}
              style={{ width: '100%', padding: '0.75rem 1rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', fontFamily: 'inherit', marginBottom: '0.5rem' }}
            />
            {ctx.repoUrlError && (
              <p className="text-small" style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{ctx.repoUrlError}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={() => send({ type: 'SUBMIT_REPO' })}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1b: Free text entry ── */}
        {stateValue === 'freetextEntry' && (
          <div>
            <button className="btn btn-secondary" onClick={() => send({ type: 'BACK' })} style={{ marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Describe Your Product</h3>
            <p className="text-small text-muted" style={{ marginBottom: '1.5rem' }}>
              Write a description of your medical device or software. Include what it does, who uses it, and its medical purpose. (minimum 20 characters)
            </p>
            <textarea
              className="glass-card"
              placeholder="e.g. CardioScan Pro is a SaMD that continuously monitors ECG signals and alerts clinicians to arrhythmias in ICU patients..."
              value={ctx.freeText}
              onChange={e => send({ type: 'SET_TEXT', value: e.target.value })}
              style={{
                width: '100%', minHeight: 160, padding: '0.75rem 1rem',
                color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)',
                fontFamily: 'inherit', resize: 'vertical', marginBottom: '0.5rem',
              }}
            />
            <p className="text-small text-muted" style={{ marginBottom: '1rem' }}>
              {ctx.freeText.trim().length} / 20 minimum characters
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                disabled={ctx.freeText.trim().length < 20}
                onClick={() => send({ type: 'SUBMIT_TEXT' })}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1c: Document upload ── */}
        {stateValue === 'documentUpload' && (
          <div>
            <button className="btn btn-secondary" onClick={() => send({ type: 'BACK' })} style={{ marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Upload Specification Document</h3>
            <p className="text-small text-muted" style={{ marginBottom: '1.5rem' }}>
              Upload an existing spec, SRS, design document, or README. Supported formats: PDF, Markdown (.md), plain text (.txt).
            </p>
            <div
              className="glass-card"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                border: '2px dashed var(--border-subtle)', marginBottom: '1rem',
              }}
            >
              <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
              <p className="text-body">
                {ctx.documentName
                  ? <><strong style={{ color: 'var(--primary)' }}>{ctx.documentName}</strong> — ready to import</>
                  : 'Click to select a file'}
              </p>
              <p className="text-small text-muted">.pdf, .md, .txt</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.md,.txt,.markdown"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                disabled={!ctx.documentName}
                onClick={() => send({ type: 'SUBMIT_DOCUMENT' })}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1d: Wizard Q&A ── */}
        {stateValue === 'wizardQA' && (
          <div>
            <button className="btn btn-secondary" onClick={() => send({ type: 'BACK' })} style={{ marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>
              Question {ctx.wizardStep + 1} of {WIZARD_QUESTIONS.length}
            </h3>
            <div className="progress-bar-bg" style={{ height: 4, marginBottom: '1.5rem' }}>
              <div className="progress-bar-fill" style={{ width: `${((ctx.wizardStep + 1) / WIZARD_QUESTIONS.length) * 100}%` }} />
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p className="text-body" style={{ marginBottom: '1rem', fontWeight: 500 }}>
                {WIZARD_QUESTIONS[ctx.wizardStep].prompt}
              </p>
              <textarea
                className="glass-card"
                value={ctx.wizardAnswers[WIZARD_QUESTIONS[ctx.wizardStep].id] ?? ''}
                onChange={e => send({
                  type: 'ANSWER_WIZARD',
                  questionId: WIZARD_QUESTIONS[ctx.wizardStep].id,
                  answer: e.target.value,
                })}
                placeholder="Your answer..."
                style={{
                  width: '100%', minHeight: 80, padding: '0.75rem',
                  color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)',
                  fontFamily: 'inherit', resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                className="btn btn-secondary"
                disabled={ctx.wizardStep === 0}
                onClick={() => {/* wizard back handled by BACK at top level */ }}
                style={{ opacity: 0.4, cursor: 'default' }}
              >
                Previous
              </button>
              {ctx.wizardStep < WIZARD_QUESTIONS.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => send({ type: 'NEXT_WIZARD_STEP' })}
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  disabled={!(ctx.wizardAnswers.productName?.trim() && ctx.wizardAnswers.intendedUse?.trim())}
                  onClick={() => send({ type: 'SUBMIT_WIZARD' })}
                >
                  Review <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Preview & confirm ── */}
        {stateValue === 'previewing' && (
          <div>
            <button className="btn btn-secondary" onClick={() => send({ type: 'BACK' })} style={{ marginBottom: '1.5rem' }}>
              <ArrowLeft size={16} /> Change Input
            </button>
            <h3 className="heading-md" style={{ marginBottom: '0.5rem' }}>Review Your Product Profile</h3>
            <p className="text-small text-muted" style={{ marginBottom: '1.5rem' }}>
              Review and edit the details below before starting certification.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div>
                <label className="text-small text-secondary" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
                  Product Name
                </label>
                <input
                  type="text"
                  className="glass-card"
                  value={ctx.parsedProductName}
                  onChange={e => send({ type: 'SET_PREVIEW_FIELD', field: 'parsedProductName', value: e.target.value })}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label className="text-small text-secondary" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
                  Intended Use
                </label>
                <textarea
                  className="glass-card"
                  value={ctx.parsedIntendedUse}
                  onChange={e => send({ type: 'SET_PREVIEW_FIELD', field: 'parsedIntendedUse', value: e.target.value })}
                  placeholder="What is the medical purpose of this product?"
                  style={{ width: '100%', minHeight: 80, padding: '0.625rem 0.875rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              <div>
                <label className="text-small text-secondary" style={{ display: 'block', marginBottom: '0.375rem', fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  className="glass-card"
                  value={ctx.parsedDescription}
                  onChange={e => send({ type: 'SET_PREVIEW_FIELD', field: 'parsedDescription', value: e.target.value })}
                  placeholder="Brief product description..."
                  style={{ width: '100%', minHeight: 80, padding: '0.625rem 0.875rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.05)', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                disabled={!ctx.parsedProductName.trim()}
                onClick={() => send({ type: 'CONFIRM' })}
                style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
              >
                Confirm & Begin Certification <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
