import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, Map as MapIcon, Settings, Bell, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import VolunteerPortal from './pages/VolunteerPortal';
import Login from './pages/Login';
import './index.css';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Command Center', icon: LayoutDashboard },
    { path: '/volunteers', label: 'Volunteer Portal', icon: Users },
  ];

  return (
    <div className="sidebar" style={{ 
      width: '260px', 
      background: 'var(--bg-secondary)', 
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      zIndex: 10
    }}>
      <div className="logo d-flex align-center gap-2 mb-4">
        <MapIcon color="var(--accent-cyan)" size={32} />
        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '1.5rem' }}>
          Volunteer<span style={{ color: 'var(--accent-cyan)' }}>Flow</span>
        </h2>
      </div>
      
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <div className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Main Menu</div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-muted)',
                background: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                transition: 'all 0.2s',
                fontWeight: isActive ? '600' : '500'
              }}
            >
              <item.icon size={20} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div style={{ paddingBottom: '1rem' }}>
         <button 
           onClick={onLogout}
           className="btn btn-outline w-full mb-4" 
           style={{ justifyContent: 'flex-start', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)' }}
         >
           <LogOut size={18} /> Sign Out
         </button>
      </div>

      <div className="user-profile" style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'var(--bg-primary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
          PN
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Pratik Nerpagar</div>
          <div className="text-xs text-muted">Admin Coordinator</div>
        </div>
      </div>
    </div>
  );
};

const Header = () => (
  <header style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 5
  }}>
    <div>
      <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>SYSTEM STATUS: <span className="badge badge-critical pulse-dot" style={{marginLeft: '0.5rem', marginRight: '0.25rem'}}></span><span style={{ color: 'var(--accent-rose)' }}>CRITICAL INCIDENT ACTIVE</span></h3>
    </div>
    <div className="d-flex align-center gap-4">
      <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Bell size={20} /></button>
      <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Settings size={20} /></button>
    </div>
  </header>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router basename="/VolunteerFlow/">
      <div className="app-container">
        <Sidebar onLogout={() => setIsAuthenticated(false)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/volunteers" element={<VolunteerPortal />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
