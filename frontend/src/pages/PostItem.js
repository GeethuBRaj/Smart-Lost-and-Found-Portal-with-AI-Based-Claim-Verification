import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const CATS = [
  'Electronics', 'Books', 'Clothing',
  'ID/Cards', 'Keys', 'Bags',
  'Jewellery', 'Sports', 'Other'
];

export default function PostItem() {
  const navigate = useNavigate();
  const [type, setType] = useState('found');
  const [form, setForm] = useState({
    name: '', category: '', description: '', location: '', date: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleImage = e => {
    const f = e.target.files[0];
    if (f) { setImage(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('type', type);
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);

      const res = await api.post('/api/items', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(
        type === 'found'
          ? '✅ Found item posted! The owner can now claim it.'
          : '⚠️ Lost item posted!'
      );
      navigate(`/items/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 660 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.7rem', marginBottom: 6 }}>
          {type === 'lost' ? '⚠️ Report Lost Item' : '✅ Report Found Item'}
        </h1>
        <p style={{ color: '#a0a0c0' }}>
          {type === 'found'
            ? 'Post what you found. The owner will answer verification questions to claim it.'
            : 'Post what you lost. If someone found it already, go to Browse and claim it.'}
        </p>
      </div>

      <div className="card">

        {/* Lost / Found toggle */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          marginBottom: 24, background: '#1e1e2a', borderRadius: 12, padding: 4
        }}>
          {['lost', 'found'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              style={{
                padding: 12, borderRadius: 10, border: 'none',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s',
                background: type === t
                  ? (t === 'lost' ? '#ff4d6d' : '#43e8b0')
                  : 'transparent',
                color: type === t
                  ? (t === 'lost' ? 'white' : '#0d0d14')
                  : '#a0a0c0'
              }}
            >
              {t === 'lost' ? '⚠️ I Lost Something' : '✅ I Found Something'}
            </button>
          ))}
        </div>

        {/* Info box — FOUND user */}
        {type === 'found' && (
          <div style={{
            background: 'rgba(67,232,176,0.08)',
            border: '1px solid rgba(67,232,176,0.2)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 22
          }}>
            <p style={{ fontSize: 14, color: '#43e8b0', fontWeight: 600, marginBottom: 6 }}>
              ✅ You just need to fill in the details and post.
            </p>
            <p style={{ fontSize: 14, color: '#a0a0c0', lineHeight: 1.6 }}>
              The system automatically prepares verification questions based on what you describe.
              The person who lost this item will answer those questions to prove ownership.
              <strong style={{ color: '#f0f0f8' }}> You do not answer anything.</strong>
            </p>
          </div>
        )}

        {/* Info box — LOST user */}
        {type === 'lost' && (
          <div style={{
            background: 'rgba(255,77,109,0.08)',
            border: '1px solid rgba(255,77,109,0.2)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 22
          }}>
            <p style={{ fontSize: 14, color: '#ff4d6d', fontWeight: 600, marginBottom: 6 }}>
              ⚠️ Post your lost item here.
            </p>
            <p style={{ fontSize: 14, color: '#a0a0c0', lineHeight: 1.6 }}>
              If someone has already found your item and posted it, go to{' '}
              <strong style={{ color: '#f0f0f8' }}>Browse → find the item → click "This is Mine"</strong>{' '}
              to go through verification and get it back.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Name + Category */}
          <div className="form-row">
            <div className="form-group">
              <label>Item Name *</label>
              <input
                placeholder={type === 'lost' ? 'e.g. My Blue Water Bottle' : 'e.g. Blue Water Bottle'}
                value={form.name}
                onChange={set('name')}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={set('category')} required>
                <option value="">Select category...</option>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>
              Description *
              <span style={{
                color: '#606080', fontWeight: 400,
                marginLeft: 8, textTransform: 'none',
                letterSpacing: 0, fontSize: 12
              }}>
                {type === 'found'
                  ? '(be very detailed — used to create verification questions)'
                  : '(describe colour, brand, size, any unique marks)'}
              </span>
            </label>
            <textarea
              placeholder={
                type === 'found'
                  ? 'Describe everything you can see — colour, brand, model, size, any scratches, stickers, marks, what is inside or attached...'
                  : 'What does it look like? Colour, brand, size, any damage, unique marks, engravings, stickers...'
              }
              value={form.description}
              onChange={set('description')}
              required
              rows={5}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Location + Date */}
          <div className="form-row">
            <div className="form-group">
              <label>{type === 'found' ? 'Where Found *' : 'Where Lost *'}</label>
              <input
                placeholder="e.g. Library 2nd Floor, Near Canteen, Lab 3"
                value={form.location}
                onChange={set('location')}
                required
              />
            </div>
            <div className="form-group">
              <label>{type === 'found' ? 'Date Found *' : 'Date Lost *'}</label>
              <input
                type="date"
                value={form.date}
                onChange={set('date')}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Photo */}
          <div className="form-group">
            <label>Photo (optional but helpful)</label>
            <div
              onClick={() => document.getElementById('imgpick').click()}
              style={{
                border: '2px dashed #2a2a3a', borderRadius: 10,
                padding: preview ? 10 : 28, textAlign: 'center',
                cursor: 'pointer', transition: 'border-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#6c63ff'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a3a'}
            >
              {preview ? (
                <img
                  src={preview} alt="preview"
                  style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 8 }}
                />
              ) : (
                <div style={{ color: '#606080' }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>📷</div>
                  <div style={{ fontSize: 14 }}>Click to upload a photo</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>JPG, PNG — max 5MB</div>
                </div>
              )}
              <input
                id="imgpick" type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleImage}
              />
            </div>
          </div>

          {/* What happens next info box */}
          <div style={{
            background: '#1e1e2a', borderRadius: 10,
            padding: '16px 18px', fontSize: 13, color: '#a0a0c0'
          }}>
            <strong style={{ color: '#f0f0f8', fontSize: 14 }}>
              📋 What happens after you post:
            </strong>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(type === 'found' ? [
                '1. Your found item is listed publicly on the campus portal',
                '2. Smart verification questions are prepared automatically',
                '3. The owner finds your listing and clicks "This is Mine"',
                '4. They answer questions to prove ownership and claim the item',
              ] : [
                '1. Your lost item is listed publicly on the campus portal',
                '2. Browse found items to see if someone already found yours',
                '3. Find your item → click "This is Mine" → answer questions',
                '4. Get your item back after verification passes!',
              ]).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: type === 'found' ? '#43e8b0' : '#ff4d6d' }}>→</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: 14, fontSize: 15 }}
          >
            {loading
              ? 'Posting...'
              : type === 'found'
              ? '✅ Post Found Item'
              : '⚠️ Post Lost Item'}
          </button>

        </form>
      </div>
    </div>
  );
}