import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../api';

export default function AdminPanel() {
  const [tab, setTab] = useState('claims');
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    Promise.all([api.get('/api/claims'), api.get('/api/items')])
      .then(([c, i]) => { setClaims(c.data); setItems(i.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const decide = async (id, decision) => {
    try {
      const res = await api.patch(`/api/claims/${id}/admin`, { decision, adminNote: notes[id] || '' });
      setClaims(prev => prev.map(c => c._id === id ? res.data : c));
      toast.success(`Claim ${decision === 'approve' ? 'approved ✅' : 'rejected ❌'}`);
    } catch { toast.error('Action failed'); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.delete(`/api/items/${id}`); setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>⚙️ Admin Panel</h1>
        <p style={{ color: '#a0a0c0' }}>Manage claims and items</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { l: 'Items', v: items.length, i: '📦', c: '#6c63ff' },
          { l: 'Claims', v: claims.length, i: '📋', c: '#43e8b0' },
          { l: 'Pending', v: claims.filter(c => ['pending','ai_approved','ai_rejected'].includes(c.status)).length, i: '⏳', c: '#ffd60a' },
          { l: 'Flagged', v: claims.filter(c => c.aiVerdict?.flagged).length, i: '🚨', c: '#ff4d6d' },
        ].map(s => (
          <div key={s.l} className="card" style={{ textAlign: 'center', padding: 18 }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{s.i}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 12, color: '#a0a0c0', marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 22, background: '#1e1e2a', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {['claims', 'items'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '9px 18px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', background: tab === t ? '#16161f' : 'transparent', color: tab === t ? '#f0f0f8' : '#a0a0c0' }}>
            {t} ({t === 'claims' ? claims.length : items.length})
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#a0a0c0' }}>Loading...</div> : (
        tab === 'claims' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {claims.length === 0 && <div style={{ textAlign: 'center', padding: 60, color: '#a0a0c0' }}>No claims yet</div>}
            {claims.map(claim => {
              const score = claim.aiVerdict?.score ?? 0;
              const sc = score >= 80 ? '#43e8b0' : score >= 60 ? '#ffd60a' : '#ff4d6d';
              const isPending = ['pending', 'ai_approved', 'ai_rejected'].includes(claim.status);
              return (
                <div key={claim._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>{claim.item?.name}</strong>
                      {claim.aiVerdict?.flagged && <span style={{ marginLeft: 8, fontSize: 12, color: '#ffd60a' }}>🚨 Flagged</span>}
                      <div style={{ fontSize: 13, color: '#a0a0c0', marginTop: 3 }}>By {claim.claimant?.name} · {claim.claimant?.rollNo}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13 }}>Status: <strong>{claim.status}</strong></div>
                      <div style={{ color: sc, fontWeight: 700, marginTop: 2 }}>Score: {score}/100</div>
                    </div>
                  </div>

                  <div className="score-track" style={{ marginBottom: 12 }}><div className="score-fill" style={{ width: `${score}%`, background: sc }} /></div>

                  {claim.aiVerdict?.reasoning && (
                    <div style={{ fontSize: 13, color: '#a0a0c0', fontStyle: 'italic', marginBottom: 12, padding: '10px 14px', background: '#1e1e2a', borderRadius: 9 }}>
                      🧠 {claim.aiVerdict.reasoning}
                    </div>
                  )}

                  <details style={{ marginBottom: 12 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 13, color: '#6c63ff' }}>View {claim.verificationAnswers?.length} answers</summary>
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {claim.verificationAnswers?.map((a, i) => (
                        <div key={i} style={{ background: '#1e1e2a', borderRadius: 8, padding: 12 }}>
                          <div style={{ fontSize: 12, color: '#606080', marginBottom: 4 }}>Q{i + 1}: {a.question}</div>
                          <div style={{ fontSize: 13 }}>→ {a.answer}</div>
                        </div>
                      ))}
                    </div>
                  </details>

                  {isPending ? (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input placeholder="Admin note (optional)" value={notes[claim._id] || ''} onChange={e => setNotes(p => ({ ...p, [claim._id]: e.target.value }))} style={{ maxWidth: 240, padding: '8px 12px' }} />
                      <button onClick={() => decide(claim._id, 'approve')} className="btn btn-success btn-sm">✓ Approve</button>
                      <button onClick={() => decide(claim._id, 'reject')} className="btn btn-danger btn-sm">✗ Reject</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: claim.status.includes('approved') ? '#43e8b0' : '#ff4d6d' }}>Final: {claim.status}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
            {items.map(item => (
              <div key={item._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className={`badge badge-${item.type}`} style={{ marginBottom: 8 }}>{item.type}</span>
                  <h3 style={{ fontSize: '1rem', marginBottom: 4 }}>{item.name}</h3>
                  <p style={{ fontSize: 12, color: '#a0a0c0' }}>📍 {item.location} · {item.category}</p>
                  <p style={{ fontSize: 12, color: '#606080', marginTop: 2 }}>By: {item.postedBy?.name}</p>
                </div>
                <button onClick={() => deleteItem(item._id)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }}>🗑</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}