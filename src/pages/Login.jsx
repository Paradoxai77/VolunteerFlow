import React, { useState } from 'react';
import { Map as MapIcon, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock authentication delay
    setTimeout(() => {
      setLoading(false);
      onLogin(true); // Login succeeds for any credentials in demo
    }, 1200);
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="panel slide-in" style={{
        maxWidth: '420px',
        width: '100%',
        padding: '3rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        <div className="logo d-flex align-center gap-2 mb-2">
          <MapIcon color="var(--accent-cyan)" size={42} />
        </div>
        <h2 style={{ color: 'var(--text-main)', fontSize: '2rem', marginBottom: '0.25rem' }}>
          Volunteer<span style={{ color: 'var(--accent-cyan)' }}>Flow</span>
        </h2>
        <p className="text-muted text-sm mb-4 text-center">Secure access to the Area Command Center and Resource Allocation Platform.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1.5rem' }}>
          <div className="form-group mb-4">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                className="form-input w-full" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="admin@volunteerflow.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group mb-4">
            <div className="d-flex justify-between w-full">
              <label className="form-label">Password</label>
              <a href="#" className="text-xs text-muted" style={{ textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                className="form-input w-full" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2 d-flex justify-between align-center" 
            style={{ padding: '0.85rem 1.25rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-4 text-xs text-muted text-center">
          Demo Mode: Any credentials will bypass authentication.
        </div>
      </div>
    </div>
  );
};

export default Login;
