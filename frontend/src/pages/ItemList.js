import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const CATS = ['Electronics','Books','Clothing','ID/Cards','Keys','Bags','Jewellery','Sports','Other'];
const ICONS = { Electronics:'💻', Books:'📚', Clothing:'👕', 'ID/Cards':'🪪', Keys:'🔑', Bags:'🎒', Jewellery:'💍', Sports:'⚽', Other:'📦' };

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (category) params.category = category;
    if (status) params.status = status;
    api.get('/api/items', { params })
      .then(r => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, type, category, status]);

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>Browse Items</h1>
        <p style={{ color: '#a0a0c0' }}>All lost and found reports on campus</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          <input placeholder="🔎 Search item..." value={search} onChange={e => setSearch(e.target.value)} />
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#a0a0c0' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
          <p style={{ color: '#a0a0c0' }}>No items found</p>
          <Link to="/post" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 18 }}>Post an Item</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
          {items.map(item => {
            const days = Math.floor((Date.now() - new Date(item.createdAt)) / 86400000);
            return (
              <Link key={item._id} to={`/items/${item._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', height: '100%', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = item.type === 'lost' ? '#ff4d6d' : '#43e8b0'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a3a'; e.currentTarget.style.transform = 'none'; }}>
                  {item.image ? (
                    <img src={`http://localhost:5000${item.image}`} alt={item.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 14 }} />
                  ) : (
                    <div style={{ height: 80, background: '#1e1e2a', borderRadius: 10, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
                      {ICONS[item.category] || '📦'}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span className={`badge badge-${item.type}`}>{item.type === 'lost' ? '⚠ Lost' : '✓ Found'}</span>
                    {item.status === 'claimed' && <span className="badge badge-claimed">Claimed</span>}
                  </div>
                  <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>{item.name}</h3>
                  <p style={{ color: '#a0a0c0', fontSize: 13, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#606080' }}>
                    <span>📍 {item.location}</span>
                    <span>{days === 0 ? 'Today' : `${days}d ago`}</span>
                  </div>
                  {item.type === 'found' && item.verificationQuestions?.length > 0 && (
                    <div style={{ marginTop: 10, padding: '5px 10px', background: 'rgba(108,99,255,0.08)', borderRadius: 7, fontSize: 12, color: '#6c63ff' }}>
                      🧠 {item.verificationQuestions.length} verification questions
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}