import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Scale,
  ClipboardList,
  Microscope,
  FileText,
  Building2,
  Globe,
  Award,
  Activity,
  ListChecks,
  MonitorPlay,
  PackageSearch,
  ChevronDown,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Circle,
} from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import type { StepId, StepStatus } from '../context/ProductContext';
import './MainLayout.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  stepId?: StepId;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { path: '/onboarding', label: 'New Product', icon: <PlusCircle size={20} /> },
  { path: '/product-setup', label: 'Product Setup', icon: <PackageSearch size={20} /> },
  { path: '/step-1', label: '1. Applicability', icon: <Stethoscope size={20} />, stepId: 'step1' },
  { path: '/step-2', label: '2. Classification', icon: <Scale size={20} />, stepId: 'step2' },
  { path: '/step-3', label: '3. QMS Builder', icon: <ClipboardList size={20} />, stepId: 'step3' },
  { path: '/sw-planning', label: 'IEC 62304 Planning', icon: <ListChecks size={20} />, stepId: 'samd' },
  { path: '/sw-architecture', label: 'SW Architecture', icon: <MonitorPlay size={20} />, stepId: 'swarch' },
  { path: '/step-4', label: '4. Clinical Data', icon: <Microscope size={20} />, stepId: 'step4' },
  { path: '/step-5', label: '5. Tech File', icon: <FileText size={20} />, stepId: 'step5' },
  { path: '/step-6', label: '6. Notified Body', icon: <Building2 size={20} />, stepId: 'step6' },
  { path: '/step-7', label: '7. EU Reqs', icon: <Globe size={20} />, stepId: 'step7' },
  { path: '/step-8', label: '8. CE Marking', icon: <Award size={20} />, stepId: 'step8' },
  { path: '/step-9', label: '9. Post-Market', icon: <Activity size={20} />, stepId: 'step9' },
];

function StepStatusIcon({ status }: { status: StepStatus | undefined }) {
  if (status === 'complete') return <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0 }} />;
  if (status === 'in_progress') return <AlertCircle size={14} color="var(--warning)" style={{ flexShrink: 0 }} />;
  return <Circle size={14} color="var(--text-muted)" style={{ flexShrink: 0, opacity: 0.4 }} />;
}

export default function MainLayout() {
  const { products, activeProductId, setActiveProduct, activeProduct, overallProgress } = useProductContext();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon flex-center">
            <Award size={24} color="var(--primary)" />
          </div>
          <h2 className="heading-md text-gradient">MDR Guide</h2>
        </div>

        <nav className="nav-menu">
          <div className="nav-section-title text-small">Roadmap</div>
          {navItems.map((item) => {
            const stepStatus = item.stepId
              ? (activeProduct?.stepProgress[item.stepId] ?? 'not_started')
              : undefined;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                {item.stepId && <StepStatusIcon status={stepStatus} />}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="progress-container">
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span className="text-small text-secondary">Overall Progress</span>
              <span className="text-small">{overallProgress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div className="flex-between">
            <h1 className="heading-lg" style={{ color: 'white' }}>EU MDR Certification Tracker</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="product-selector" style={{ position: 'relative', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
                <span className="text-small" style={{ color: 'white', marginRight: '0.5rem', opacity: 0.8 }}>Product:</span>
                <select
                  value={activeProductId || ''}
                  onChange={(e) => setActiveProduct(e.target.value || null)}
                  style={{
                    background: 'transparent',
                    color: 'white',
                    border: 'none',
                    outline: 'none',
                    appearance: 'none',
                    paddingRight: '1.5rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ color: 'black' }}>-- Select a Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} style={{ color: 'black' }}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} color="white" style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }} />
              </div>
            </div>
          </div>
        </header>
        <div className="content-scroll view-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
