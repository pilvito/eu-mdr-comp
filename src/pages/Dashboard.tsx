import React from 'react';
import { Stethoscope, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProcessFlow from '../components/ProcessFlow';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div className="glass-panel mb-8" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div className="flex-between">
          <div>
            <h2 className="heading-lg mb-4" style={{ marginBottom: '1rem' }}>Your MDR & SaMD Journey</h2>
            <p className="text-body" style={{ maxWidth: '800px' }}>
              A structured roadmap to EU MDR certification and IEC 62304 software compliance. 
              Follow the tracks below to understand your regulatory pathway. Click any node to drill into the specific requirements.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/step-1')} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', whiteSpace: 'nowrap' }}>
            Applicability Check <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <ProcessFlow />
    </div>
  );
}
