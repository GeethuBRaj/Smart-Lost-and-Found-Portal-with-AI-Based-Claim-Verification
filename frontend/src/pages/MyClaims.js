import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS = {
  pending: { l: 'Pending', c: '#606080' },
  ai_approved: { l: '✓ Approved', c: '#43e8b0' },
  ai_rejected: { l: '✗ Rejected', c: '#ff4d6d' },
  admin_approved: { l: '✅ Admin Approved', c: '#43e8b0' },
  admin_rejected: { l: '❌ Admin Rejected', c: '#ff4d6d' }
};

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/claims/my').then(r => setClaims(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 6 }}>My Claims</h1>
        <p style={{ color: '#a0a0c0' }}>Track your verification results</p>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#a0a0c0' }}>Loading...</div>
        : claims.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ fontSize: 46, marginBottom: 14 }}>📋</div>
            <p style={{ color: '#a0a0c0', marginBottom: 18 }}>No claims yet</p>
            <Link to="/items?type=found" className="btn btn-primary" style={{ display: 'inline-flex' }}>Browse Found Items</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {claims.map(claim => {
              const st = STATUS[claim.status] || STATUS.pending;
              const score = claim.aiVerdict?.score;
              const sc = score >= 80 ? '#43e8b0' : score >= 60 ? '#ffd60a' : '#ff4d6d';
              return (
                <div key={claim._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                    <div>
                      <Link to={`/items/${claim.item._id}`} style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f0f8' }}>{claim.item.name}</Link>
                      <div style={{ fontSize: 13, color: '#a0a0c0', marginTop: 3 }}>{claim.item.category} · 📍 {claim.item.location}</div>
                      <div style={{ fontSize: 12, color: '#606080', marginTop: 3 }}>{new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: st.c, fontWeight: 700 }}>{st.l}</div>
                      {score !== undefined && <div style={{ fontSize: 13, color: sc, marginTop: 3 }}>Score: {score}/100</div>}
                    </div>
                  </div>
                  {score !== undefined && <div className="score-track" style={{ marginBottom: 12 }}><div className="score-fill" style={{ width: `${score}%`, background: sc }} /></div>}
                  {claim.aiVerdict?.reasoning && (
                    <div style={{ padding: '10px 14px', background: '#1e1e2a', borderRadius: 9, fontSize: 13, color: '#a0a0c0', lineHeight: 1.6 }}>
                      🧠 {claim.aiVerdict.reasoning}
                    </div>
                  )}
                  {claim.adminNote && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(108,99,255,0.06)', borderRadius: 9, border: '1px solid rgba(108,99,255,0.2)', fontSize: 13, color: '#a0a0c0' }}>
                      <span style={{ color: '#6c63ff', fontWeight: 600 }}>Admin: </span>{claim.adminNote}
                    </div>
                  )}
                  {claim.aiVerdict?.flagged && <div style={{ marginTop: 10, padding: '7px 12px', background: 'rgba(255,214,10,0.08)', borderRadius: 8, fontSize: 13, color: '#ffd60a' }}>⚠️ Flagged for manual review</div>}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}