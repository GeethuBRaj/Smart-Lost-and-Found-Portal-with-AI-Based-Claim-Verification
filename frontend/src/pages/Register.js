import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', rollNo: '', department: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/items');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>🎓</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Create account</h2>
          <p style={{ color: '#a0a0c0', fontSize: 14 }}>Join the campus lost & found network</p>
        </div>

        {error && <div className="error-box">❌ {error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input placeholder="Your full name" value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Roll No</label>
              <input placeholder="AM.SC.P2AML25001" value={form.rollNo} onChange={set('rollNo')} />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input placeholder="Computer Science" value={form.department} onChange={set('department')} />
            </div>
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 6, padding: 13 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#a0a0c0', fontSize: 14 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}