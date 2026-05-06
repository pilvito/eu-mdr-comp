import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  ClipboardList, 
  FileText, 
  Briefcase, 
  Database, 
  Building2, 
  Award,
  Code,
  ListChecks,
  MonitorPlay,
  Cpu,
  TestTube,
  PackageCheck
} from 'lucide-react';
import './ProcessFlow.css';

const mdrSteps = [
  { id: '1', title: 'Determine Classification', subtitle: 'Class I - III', path: '/step-2', icon: <Scale size={24} />, color: 'var(--info)' },
  { id: '2', title: 'Implement QMS', subtitle: 'ISO 13485', path: '/step-3', icon: <ClipboardList size={24} />, color: 'var(--success)' },
  { id: '3', title: 'Prepare Technical File', subtitle: 'MDR Annex II/III', path: '/step-5', icon: <FileText size={24} />, color: 'var(--warning)' },
  { id: '4', title: 'Appoint EC REP', subtitle: 'For non-EU', path: '/step-7', icon: <Briefcase size={24} />, color: 'var(--primary)' },
  { id: '5', title: 'Register in EUDAMED', subtitle: 'Get UDI', path: '/step-7', icon: <Database size={24} />, color: 'var(--info)' },
  { id: '6', title: 'Notified Body Audit', subtitle: 'For Class II/III', path: '/step-6', icon: <Building2 size={24} />, color: 'var(--danger)' },
  { id: '7', title: 'CE Marking', subtitle: 'Declaration of Conformity', path: '/step-8', icon: <Award size={24} />, color: 'var(--success)' },
];

const swSteps = [
  { id: 's1', title: 'SW Dev Planning', path: '/sw-planning', icon: <ListChecks size={20} /> },
  { id: 's2', title: 'Requirements', path: '/sw-architecture', icon: <ClipboardList size={20} /> },
  { id: 's3', title: 'Architecture', path: '/sw-architecture', icon: <MonitorPlay size={20} /> },
  { id: 's4', title: 'Detailed Design', path: '/step-5', icon: <Cpu size={20} /> },
  { id: 's5', title: 'Implementation', path: '/step-5', icon: <Code size={20} /> },
  { id: 's6', title: 'Testing', path: '/step-5', icon: <TestTube size={20} /> },
  { id: 's7', title: 'Release', path: '/step-9', icon: <PackageCheck size={20} /> },
];

export default function ProcessFlow() {
  const navigate = useNavigate();

  return (
    <div className="process-flow-container">
      <div className="flow-track mdr-track">
        <h3 className="track-title heading-md text-gradient">MDR Regulatory Pathway</h3>
        <p className="track-subtitle text-small">General medical device requirements (MDR 2017/745)</p>
        
        <div className="nodes-container vertical-nodes">
          {mdrSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className="flow-node glass-card"
                onClick={() => navigate(step.path)}
                style={{ '--node-color': step.color } as React.CSSProperties}
              >
                <div className="node-icon" style={{ color: step.color }}>{step.icon}</div>
                <div>
                  <h4 className="node-title">{step.title}</h4>
                  <p className="node-subtitle">{step.subtitle}</p>
                </div>
              </div>
              {index < mdrSteps.length - 1 && (
                <div className="flow-connector">
                  <div className="connector-line"></div>
                  <div className="connector-arrow"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flow-track sw-track">
        <h3 className="track-title heading-md" style={{ color: 'var(--primary)' }}>Software Lifecycle (IEC 62304)</h3>
        <p className="track-subtitle text-small">Specific requirements for Medical Device Software (SaMD)</p>

        <div className="nodes-container vertical-nodes compact-nodes">
          {swSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div 
                className="flow-node compact glass-card"
                onClick={() => navigate(step.path)}
                style={{ '--node-color': 'var(--primary)' } as React.CSSProperties}
              >
                <div className="node-icon">{step.icon}</div>
                <div>
                  <h4 className="node-title">{step.title}</h4>
                </div>
              </div>
              {index < swSteps.length - 1 && (
                <div className="flow-connector dashed">
                  <div className="connector-line"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
