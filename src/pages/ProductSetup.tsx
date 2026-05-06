import { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import { PackageSearch, MonitorPlay, Plus, Link as LinkIcon, Trash2 } from 'lucide-react';

export default function ProductSetup() {
  const { 
    products, 
    softwareItems, 
    addProduct, 
    addSoftwareItem, 
    linkSoftwareItemToProduct,
    unlinkSoftwareItemFromProduct
  } = useProductContext();

  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  
  const [newSwName, setNewSwName] = useState('');
  const [newSwDesc, setNewSwDesc] = useState('');

  const [selectedProductToLink, setSelectedProductToLink] = useState('');
  const [selectedSwToLink, setSelectedSwToLink] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductName.trim()) {
      addProduct({ name: newProductName, description: newProductDesc });
      setNewProductName('');
      setNewProductDesc('');
    }
  };

  const handleAddSoftwareItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSwName.trim()) {
      addSoftwareItem({ name: newSwName, description: newSwDesc });
      setNewSwName('');
      setNewSwDesc('');
    }
  };

  const handleLink = () => {
    if (selectedProductToLink && selectedSwToLink) {
      linkSoftwareItemToProduct(selectedProductToLink, selectedSwToLink);
      setSelectedProductToLink('');
      setSelectedSwToLink('');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="mb-8">
        <h2 className="heading-lg mb-2">Product & Software Portfolio</h2>
        <p className="text-body text-secondary">
          Define the products you are certifying under EU MDR and associate the relevant software items (SaMD / SiMD) with each product.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Create Product Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex-center mb-4" style={{ justifyContent: 'flex-start', gap: '10px' }}>
            <PackageSearch color="var(--primary)" />
            <h3 className="heading-md">1. Create Product</h3>
          </div>
          <form onSubmit={handleAddProduct}>
            <div className="mb-4">
              <label className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Product Name</label>
              <input 
                type="text" 
                value={newProductName} 
                onChange={(e) => setNewProductName(e.target.value)} 
                placeholder="e.g., Cardiac Analyzer Pro"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
              <textarea 
                value={newProductDesc} 
                onChange={(e) => setNewProductDesc(e.target.value)} 
                placeholder="Brief description of the medical device..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', minHeight: '80px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Add Product
            </button>
          </form>
        </div>

        {/* Create Software Item Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex-center mb-4" style={{ justifyContent: 'flex-start', gap: '10px' }}>
            <MonitorPlay color="var(--primary)" />
            <h3 className="heading-md">2. Create Software Item</h3>
          </div>
          <form onSubmit={handleAddSoftwareItem}>
            <div className="mb-4">
              <label className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Software Name</label>
              <input 
                type="text" 
                value={newSwName} 
                onChange={(e) => setNewSwName(e.target.value)} 
                placeholder="e.g., AI Diagnostics Module v2"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
              <textarea 
                value={newSwDesc} 
                onChange={(e) => setNewSwDesc(e.target.value)} 
                placeholder="Brief description of the software functionality..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', minHeight: '80px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-1)', border: 'none', color: '#fff' }}>
              <Plus size={18} /> Add Software
            </button>
          </form>
        </div>
      </div>

      {/* Linking Section */}
      {(products.length > 0 && softwareItems.length > 0) && (
        <div className="glass-panel mb-8" style={{ padding: '2rem' }}>
          <div className="flex-center mb-4" style={{ justifyContent: 'flex-start', gap: '10px' }}>
            <LinkIcon color="var(--primary)" />
            <h3 className="heading-md">3. Link Software to Products</h3>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Product</label>
              <select 
                value={selectedProductToLink} 
                onChange={(e) => setSelectedProductToLink(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
              >
                <option value="">-- Choose Product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="text-small" style={{ display: 'block', marginBottom: '0.5rem' }}>Select Software Item</label>
              <select 
                value={selectedSwToLink} 
                onChange={(e) => setSelectedSwToLink(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
              >
                <option value="">-- Choose Software --</option>
                {softwareItems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleLink}
              disabled={!selectedProductToLink || !selectedSwToLink}
              style={{ padding: '0.75rem 1.5rem', opacity: (!selectedProductToLink || !selectedSwToLink) ? 0.5 : 1 }}
            >
              Link Items
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      <h3 className="heading-md mb-4" style={{ marginTop: '3rem' }}>Current Portfolio Overview</h3>
      {products.length === 0 ? (
        <div className="glass-panel flex-center" style={{ padding: '3rem', flexDirection: 'column', color: 'var(--text-secondary)' }}>
          <PackageSearch size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No products created yet. Start by defining a product above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {products.map(product => (
            <div key={product.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div>
                <h4 className="heading-sm mb-2" style={{ color: 'var(--primary)' }}>{product.name}</h4>
                {product.description && <p className="text-small text-secondary mb-4">{product.description}</p>}
              </div>
              
              <div style={{ marginTop: 'auto', background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div className="text-small" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MonitorPlay size={14} /> Associated Software ({product.softwareItemIds.length})
                </div>
                {product.softwareItemIds.length === 0 ? (
                  <p className="text-small text-secondary" style={{ fontStyle: 'italic' }}>No software items linked yet.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {product.softwareItemIds.map(swId => {
                      const sw = softwareItems.find(s => s.id === swId);
                      if (!sw) return null;
                      return (
                        <li key={swId} className="flex-between text-small" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                          <span>{sw.name}</span>
                          <button 
                            onClick={() => unlinkSoftwareItemFromProduct(product.id, swId)}
                            style={{ background: 'none', border: 'none', color: 'var(--error, #e53e3e)', cursor: 'pointer', padding: '0.25rem' }}
                            title="Unlink"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {softwareItems.length > 0 && products.length === 0 && (
        <div className="glass-panel mt-8" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <h4 className="heading-sm mb-2">Unlinked Software Items</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {softwareItems.map(sw => (
              <li key={sw.id} className="text-small mb-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <strong>{sw.name}</strong> - <span className="text-secondary">{sw.description || 'No description'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
