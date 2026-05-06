import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

export default function Step1() {
  const navigate = useNavigate();
  const { activeProductId, activeProduct, updateProductIntendedUse, updateStepProgress } = useProductContext();

  // Pre-populate from product context if available
  const [intendedUse, setIntendedUse] = useState(activeProduct?.intendedUse ?? '');
  const [answers, setAnswers] = useState<{
    diagnose: boolean | null;
    treat: boolean | null;
    monitor: boolean | null;
    prevent: boolean | null;
  }>({
    diagnose: null,
    treat: null,
    monitor: null,
    prevent: null,
  });

  const handleAnswer = (key: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const isMedicalDevice = Object.values(answers).some(a => a === true);
  const isComplete = intendedUse.length >= 10 && Object.values(answers).every(a => a !== null);

  const handleContinue = () => {
    if (activeProductId) {
      updateProductIntendedUse(activeProductId, intendedUse);
      updateStepProgress(activeProductId, 'step1', 'complete');
    }
    navigate('/step-2');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <button
        className="btn btn-secondary mb-6"
        onClick={() => navigate('/')}
        style={{ marginBottom: '2rem' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 className="heading-lg mb-2">Step 1: Confirm Applicability</h2>
        <p className="text-body mb-8" style={{ marginBottom: '2rem' }}>
          Before anything else, you must define your product's intended use. This determines whether it falls under the EU MDR requirements or other regulations (e.g. wellness, AI, pharma).
        </p>

        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="heading-md" style={{ display: 'block', marginBottom: '1rem' }}>
            What is the Intended Use of your product?
          </label>
          <textarea
            className="glass-card"
            style={{
              width: '100%',
              minHeight: '120px',
              color: 'var(--text-primary)',
              background: 'rgba(255,255,255,0.05)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            placeholder="Describe explicitly what the device is intended to do..."
            value={intendedUse}
            onChange={(e) => setIntendedUse(e.target.value)}
          />
        </div>

        <div className="questionnaire" style={{ marginBottom: '3rem' }}>
          <h3 className="heading-md" style={{ marginBottom: '1rem' }}>Does your product explicitly claim to:</h3>

          {[
            { key: 'diagnose', label: 'Diagnose a disease, injury, or disability?' },
            { key: 'treat', label: 'Treat or alleviate a disease, injury, or disability?' },
            { key: 'monitor', label: 'Monitor a physiological process or state?' },
            { key: 'prevent', label: 'Prevent a disease?' },
          ].map((q) => (
            <div key={q.key} className="glass-card flex-between" style={{ padding: '1rem 1.5rem', marginBottom: '1rem' }}>
              <span className="text-body" style={{ color: 'var(--text-primary)' }}>{q.label}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn ${answers[q.key as keyof typeof answers] === true ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleAnswer(q.key, true)}
                >
                  Yes
                </button>
                <button
                  className={`btn ${answers[q.key as keyof typeof answers] === false ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleAnswer(q.key, false)}
                  style={{ background: answers[q.key as keyof typeof answers] === false ? 'var(--danger)' : '' }}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="result-card glass-card" style={{
            background: isMedicalDevice ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: isMedicalDevice ? 'var(--success)' : 'var(--danger)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {isMedicalDevice ? <CheckCircle size={32} color="var(--success)" /> : <AlertTriangle size={32} color="var(--danger)" />}
              <div>
                <h4 className="heading-md" style={{ color: isMedicalDevice ? 'var(--success)' : 'var(--danger)', marginBottom: '0.25rem' }}>
                  {isMedicalDevice ? 'Likely a Medical Device' : 'Likely NOT a Medical Device'}
                </h4>
                <p className="text-small" style={{ color: 'var(--text-primary)' }}>
                  {isMedicalDevice
                    ? 'Based on your claims, your product falls under MDR. You must proceed to classification.'
                    : 'Since no medical claims are made, this might fall under other wellness or AI regulations instead of MDR.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-between">
          <span className="text-small text-muted flex-center" style={{ gap: '0.5rem' }}>
            <HelpCircle size={16} /> This is a critical step because it determines everything else.
          </span>
          <button
            className="btn btn-primary"
            disabled={!isComplete || !isMedicalDevice}
            onClick={handleContinue}
          >
            Continue to Classification <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
