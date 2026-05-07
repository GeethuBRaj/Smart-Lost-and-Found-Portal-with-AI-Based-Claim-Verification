import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(108,99,255,0.12) 0%, transparent 70%)' }}>
        <div className="fade-in" style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: 18, lineHeight: 1.15 }}>
            Lost Something on<br /><span style={{ color: '#6c63ff' }}>Campus?</span>
          </h1>
          <p style={{ fontSize: 17, color: '#a0a0c0', marginBottom: 36, lineHeight: 1.7 }}>
            Smart campus portal with built-in ownership verification. Only the real owner can claim.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/items" className="btn btn-primary" style={{ padding: '13px 30px', fontSize: 16 }}>Browse Items</Link>
            <Link to={user ? '/post' : '/register'} className="btn btn-ghost" style={{ padding: '13px 30px', fontSize: 16 }}>
              {user ? '+ Post Item' : 'Join Free'}
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '50px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.6rem', marginBottom: 36 }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
          {[
            { icon: '📢', title: 'Post Items', desc: 'Report lost or found items with details and photo.' },
            { icon: '🧠', title: 'Auto Questions', desc: 'Smart questions are generated from your item description.' },
            { icon: '📝', title: 'Answer & Score', desc: 'Claimant answers — system scores for authenticity.' },
            { icon: '✅', title: 'Claim Approved', desc: 'High scores auto-approve. Admin reviews the rest.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: '#a0a0c0', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}