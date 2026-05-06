import React, { useState, useEffect } from 'react';
import { Plus, ListChecks, MonitorPlay, Save, Check } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import type { SoftwareArchitectureItem } from '../context/ProductContext';
import StepPrerequisiteWarning from '../components/StepPrerequisiteWarning';

const DEMO_ITEM: SoftwareArchitectureItem = {
  id: 'demo-item-1',
  name: 'EHR Core Database',
  requirements: [{ id: 'r1', text: 'Must support 10,000 concurrent patient record fetches.' }],
  architectureDetails: 'PostgreSQL hosted on AWS RDS. Multi-AZ deployment for high availability.',
};

type ActiveTab = 'requirements' | 'architecture';

export default function SoftwareArchitecture() {
  const { activeProductId, activeProduct, updateSwArchitectureData, updateStepProgress } = useProductContext();

  // Restore from context if available, otherwise use demo item
  const [items, setItems] = useState<SoftwareArchitectureItem[]>(() => {
    if (activeProduct && activeProduct.swArchitectureData.length > 0) {
      return activeProduct.swArchitectureData;
    }
    return [DEMO_ITEM];
  });

  const [activeItemId, setActiveItemId] = useState<string>(
    items[0]?.id ?? DEMO_ITEM.id
  );
  const [newItemName, setNewItemName] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('requirements');
  const [newRequirement, setNewRequirement] = useState('');
  const [savedStatus, setSavedStatus] = useState(false);

  // Re-sync when active product switches
  useEffect(() => {
    if (activeProduct && activeProduct.swArchitectureData.length > 0) {
      setItems(activeProduct.swArchitectureData);
      setActiveItemId(activeProduct.swArchitectureData[0].id);
    } else {
      setItems([DEMO_ITEM]);
      setActiveItemId(DEMO_ITEM.id);
    }
  }, [activeProductId]);

  const activeItem = items.find(item => item.id === activeItemId);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: SoftwareArchitectureItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      requirements: [],
      architectureDetails: '',
    };

    setItems([...items, newItem]);
    setActiveItemId(newItem.id);
    setNewItemName('');
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequirement.trim() || !activeItem) return;

    const updatedItems = items.map(item => {
      if (item.id === activeItemId) {
        return {
          ...item,
          requirements: [...item.requirements, { id: `req-${Date.now()}`, text: newRequirement }],
        };
      }
      return item;
    });

    setItems(updatedItems);
    setNewRequirement('');
  };

  const handleUpdateArchitecture = (val: string) => {
    if (!activeItem) return;
    const updatedItems = items.map(item =>
      item.id === activeItemId ? { ...item, architectureDetails: val } : item
    );
    setItems(updatedItems);
  };

  const handleSave = () => {
    setSavedStatus(true);
    // Persist to context
    if (activeProductId) {
      updateSwArchitectureData(activeProductId, items);
      updateStepProgress(
        activeProductId,
        'swarch',
        items.filter(i => i.id !== 'demo-item-1').length > 0 ? 'in_progress' : 'not_started'
      );
    }
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <StepPrerequisiteWarning stepId="swarch" />
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', height: '100%', minHeight: 'calc(100vh - 160px)' }}>
        {/* Sidebar / List of items */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 className="heading-md mb-6" style={{ marginBottom: '1.5rem' }}>Software Items</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', flex: 1, overflowY: 'auto' }}>
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveItemId(item.id)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: activeItemId === item.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  border: activeItemId === item.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <h4 className="heading-md" style={{ fontSize: '1rem', margin: 0, color: activeItemId === item.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {item.name}
                </h4>
                <p className="text-small text-muted" style={{ margin: 0, marginTop: '0.25rem' }}>
                  {item.requirements.length} requirements
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="New component name..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', minWidth: '40px' }}>
              <Plus size={20} />
            </button>
          </form>
        </div>

        {/* Main Detail Area */}
        {activeItem ? (
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
              <div>
                <h2 className="heading-lg" style={{ marginBottom: '0.25rem' }}>{activeItem.name}</h2>
                <p className="text-body text-muted">Define structure across IEC 62304 criteria</p>
              </div>

              <button className="btn btn-primary" onClick={handleSave}>
                {savedStatus ? <Check size={20} /> : <Save size={20} />}
                {savedStatus ? 'Saved!' : 'Save Item'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('requirements')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === 'requirements' ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: '0',
                  padding: '0.75rem 1rem',
                  color: activeTab === 'requirements' ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                <ListChecks size={18} /> Requirements (5.2)
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setActiveTab('architecture')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  borderBottom: activeTab === 'architecture' ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: '0',
                  padding: '0.75rem 1rem',
                  color: activeTab === 'architecture' ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                <MonitorPlay size={18} /> Architecture (5.3)
              </button>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'requirements' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeItem.requirements.length === 0 ? (
                      <div className="text-center text-muted" style={{ padding: '2rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                        No requirements defined yet. Add one below.
                      </div>
                    ) : (
                      activeItem.requirements.map((req, idx) => (
                        <div key={req.id} className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>REQ-{idx + 1}</span>
                          <p className="text-body" style={{ margin: 0 }}>{req.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddRequirement} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <input
                      type="text"
                      placeholder="Enter a new software requirement..."
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', outline: 'none' }}
                    />
                    <button type="submit" className="btn btn-secondary">
                      Add Requirement
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <p className="text-body mb-4" style={{ marginBottom: '1rem' }}>
                    Describe the structured architecture showing software components, interfaces, and interactions for this item.
                  </p>
                  <textarea
                    value={activeItem.architectureDetails}
                    onChange={(e) => handleUpdateArchitecture(e.target.value)}
                    placeholder="e.g., The system consists of a microservices backend communicating via REST with the React frontend..."
                    style={{
                      flex: 1,
                      width: '100%',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      fontFamily: 'inherit',
                      fontSize: '1rem',
                      resize: 'none',
                      outline: 'none',
                      minHeight: '200px',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel flex-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
            Select or add a software item to start defining its structure.
          </div>
        )}
      </div>
    </div>
  );
}
