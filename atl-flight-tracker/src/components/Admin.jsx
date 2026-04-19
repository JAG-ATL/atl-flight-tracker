import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { fetchLocations, updateLocation, deleteLocation } from '../api';

export default function Admin() {
  const [locations, setLocations] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showQR, setShowQR] = useState(null); // stores {id, name}
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    lat: '',
    lng: '',
    distanceMiles: '',
    shuttle: '',
    phone: ''
  });

  const downloadQR = (id, name) => {
    const svg = document.getElementById(`qr-svg-${id}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 100;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      ctx.fillStyle = "black";
      ctx.font = "bold 16px Inter";
      ctx.textAlign = "center";
      ctx.fillText(name, canvas.width / 2, img.height + 60);
      ctx.font = "12px Inter";
      ctx.fillText("Scan for Live Flight Info", canvas.width / 2, img.height + 80);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `ATL-QR-${id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setIsLoading(true);
    const res = await fetchLocations();
    if (res.success) {
      setLocations(res.data);
    }
    setIsLoading(false);
  };

  const handleEdit = (id, data) => {
    setEditingId(id);
    setDeletingId(null);
    setFormData({ id, ...data });
  };

  const handleDelete = async (id) => {
    if (deletingId === id) {
      const res = await deleteLocation(id);
      if (res.success) {
        setDeletingId(null);
        loadLocations();
      }
    } else {
      setDeletingId(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, ...details } = formData;
    const res = await updateLocation(id, details);
    if (res.success) {
      setEditingId(null);
      setFormData({ id: '', name: '', lat: '', lng: '', distanceMiles: '', shuttle: '', phone: '' });
      loadLocations();
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <div className="loader-dots"><div></div><div></div><div></div></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-xl">Admin Dashboard</h1>
            <p className="text-sm text-secondary">Hotel & Location Management</p>
          </div>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => {
            setEditingId('new');
            setDeletingId(null);
            setFormData({ id: '', name: '', lat: '', lng: '', distanceMiles: '', shuttle: '', phone: '' });
          }}
          style={{ fontSize: '0.8rem' }}
        >
          + Add New Location
        </button>
      </header>

      {editingId && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--text-accent)', boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)' }}>
          <h2 className="text-md mb-4" style={{ color: 'var(--text-accent)' }}>
            {editingId === 'new' ? 'Initialize New Location' : `Editing: ${formData.name}`}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: editingId === 'new' ? 'span 1' : 'span 2' }}>
              <label className="text-xs text-secondary mb-1 block">Location ID (slug)</label>
              <input 
                className="input-field" 
                placeholder="e.g. hilton-atl"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={editingId !== 'new'}
                required
              />
            </div>
            <div>
              <label className="text-xs text-secondary mb-1 block">Full Display Name</label>
              <input 
                className="input-field" 
                placeholder="e.g. Hilton Atlanta Airport"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-secondary mb-1 block">Latitude</label>
              <input 
                className="input-field" 
                type="number" step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-secondary mb-1 block">Longitude</label>
              <input 
                className="input-field" 
                type="number" step="any"
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-secondary mb-1 block">Distance (miles)</label>
              <input 
                className="input-field" 
                type="number" step="0.1"
                value={formData.distanceMiles}
                onChange={(e) => setFormData({ ...formData, distanceMiles: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-secondary mb-1 block">Shuttle Frequency</label>
              <input 
                className="input-field" 
                placeholder="e.g. Every 15 mins"
                value={formData.shuttle}
                onChange={(e) => setFormData({ ...formData, shuttle: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-secondary mb-1 block">Phone Number</label>
              <input 
                className="input-field" 
                placeholder="e.g. 404-123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                {editingId === 'new' ? 'Confirm & Create' : 'Apply Changes'}
              </button>
              <button 
                type="button" 
                className="glass-card" 
                style={{ flex: 0.5, background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid var(--surface-border)' }}
                onClick={() => setEditingId(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        {Object.entries(locations).map(([id, data]) => (
          <div key={id} className="glass-card animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                🏨
              </div>
              <div>
                <h3 className="text-md" style={{ marginBottom: '2px' }}>{data.name}</h3>
                <p className="text-xs text-secondary">
                  <code>{id}</code> • {data.distanceMiles}mi • {data.shuttle || 'No schedule'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowQR({ id, name: data.name })}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--surface-border)', color: 'var(--text-primary)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="3" height="3"></rect>
                  <rect x="14" y="7" width="3" height="3"></rect>
                  <rect x="7" y="14" width="3" height="3"></rect>
                  <rect x="14" y="14" width="3" height="3"></rect>
                </svg>
                QR Code
              </button>
              <button 
                onClick={() => handleEdit(id, data)}
                style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: 'var(--text-accent)', borderRadius: '8px', padding: '8px 16px', fontSize: '0.75rem', cursor: 'pointer', transition: 'var(--transition)' }}
              >
                Modify
              </button>
              <button 
                onClick={() => handleDelete(id)}
                style={{ 
                  background: deletingId === id ? 'rgba(239, 44, 44, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
                  border: deletingId === id ? '1px solid var(--status-cancelled)' : '1px solid var(--surface-border)', 
                  color: deletingId === id ? 'var(--status-cancelled)' : 'var(--text-secondary)', 
                  borderRadius: '8px', 
                  padding: '8px 16px', 
                  fontSize: '0.75rem', 
                  cursor: 'pointer',
                  fontWeight: deletingId === id ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                {deletingId === id ? 'Confirm Delete?' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel animate-fade-up" style={{ padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
            <h2 className="text-lg mb-2">{showQR.name}</h2>
            <p className="text-xs text-secondary mb-6">QR Code for Digital Signage</p>
            
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
              <QRCodeSVG 
                id={`qr-svg-${showQR.id}`}
                value={`${window.location.origin}/?hotelId=${showQR.id}`}
                size={250}
                level="H"
                includeMargin={true}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={() => downloadQR(showQR.id, showQR.name)}
              >
                Download PNG Image
              </button>
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}
                onClick={() => setShowQR(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '60px', padding: '40px', textAlign: 'center', borderTop: '1px solid var(--surface-border)' }}>
         <a href="/" style={{ color: 'var(--text-accent)', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Public Tracker
         </a>
      </div>
    </div>
  );
}
