import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      style={{
        padding: '7px 14px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        color: pathname === to ? '#6c63ff' : '#a0a0c0',
        background: pathname === to ? 'rgba(108,99,255,0.1)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav style={{
        background: 'rgba(13,13,20,0.97)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #2a2a3a',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '0 20px',
          height: 62,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, background: '#6c63ff',
              borderRadius: 9, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 17
            }}>🔍</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#f0f0f8' }}>
              Campus<span style={{ color: '#6c63ff' }}>Find</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            {navLink('/items', 'Browse')}
            {navLink('/post', '+ Post Item')}
            {user && navLink('/my-claims', 'My Claims')}
            {user?.role === 'admin' && navLink('/admin', '⚙ Admin')}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {user ? (
              <>
                {/* User info chip */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '5px 12px',
                  background: '#16161f',
                  border: '1px solid #2a2a3a',
                  borderRadius: 8
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: '#6c63ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  {/* Name */}
                  <span style={{
                    fontSize: 13, color: '#a0a0c0',
                    maxWidth: 100, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {user.name}
                  </span>
                </div>

                {/* Logout button — clearly visible */}
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#ff4d6d',
                    borderColor: 'rgba(255,77,109,0.3)',
                    padding: '7px 14px'
                  }}
                >
                  <span>⏻</span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* User info bar — shows below navbar when logged in */}
      {user && (
        <div style={{
          background: '#0d0d14',
          borderBottom: '1px solid #1a1a24',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#606080'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>
              Logged in as <strong style={{ color: '#a0a0c0' }}>{user.name}</strong>
            </span>
            {user.email && (
              <span style={{ color: '#404060' }}>
                {user.email}
              </span>
            )}
            {user.rollNo && (
              <span style={{ color: '#404060' }}>
                Roll: {user.rollNo}
              </span>
            )}
            {user.role === 'admin' && (
              <span style={{
                background: 'rgba(108,99,255,0.15)',
                color: '#6c63ff',
                padding: '1px 8px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600
              }}>
                ADMIN
              </span>
            )}
          </div>

          {/* Quick logout in info bar too */}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff4d6d',
              fontSize: 12,
              cursor: 'pointer',
              padding: '2px 8px',
              borderRadius: 6,
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,109,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Sign out →
          </button>
        </div>
      )}
    </>
  );
}