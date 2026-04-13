import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Target, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

const VolunteerPortal = () => {
  const [operatorName, setOperatorName] = useState("");
  const [phone, setPhone] = useState("");
  const [capability, setCapability] = useState("");
  
  const [registered, setRegistered] = useState(false);
  const [assignedTask, setAssignedTask] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistered(true);
    
    try {
      const res = await fetch('/api/volunteer/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: operatorName,
          phone: phone,
          capability: capability,
          lat: 28.6139,
          lon: 77.2090
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAssignedTask(data);
      } else {
        console.error("Assignment Engine Failed.");
      }
    } catch (err) {
      console.error("API offline:", err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div className="mb-4 text-center">
        <h1>Field Agent Onboarding</h1>
        <p className="text-muted">Register your operational capability to receive dynamic routing assignments.</p>
      </div>

      {!registered ? (
        <div className="panel slide-in">
          <div className="panel-header text-sm font-bold d-flex align-center gap-2">
            <FileText size={16} /> Unit Credential Logging
          </div>
          <form onSubmit={handleRegister}>
            <div className="d-flex gap-4 mb-4">
              <div className="form-group w-full">
                <label className="form-label">Operator Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. A. Johnson" 
                  required 
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
              </div>
              <div className="form-group w-full">
                <label className="form-label">Comms frequency (Phone)</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="+1 (555) 000-0000" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Operational Capability</label>
              <select 
                className="form-select" 
                required 
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
              >
                <option value="">Select a capability</option>
                <option value="medical">Class A - Paramedic / First Aid</option>
                <option value="logistics">Class B - Heavy/Light Transport</option>
                <option value="rescue">Class C - HAZMAT / Search & Rescue</option>
                <option value="general">Class D - General Logistics Support</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Current Telemetry (GPS)</label>
              <div className="d-flex align-center gap-2">
                <input type="text" className="form-input w-full" value="28.6139° N, 77.2090° E" readOnly style={{ background: 'var(--bg-tertiary)' }} />
                <button type="button" className="btn btn-outline" style={{ padding: '0.6rem 0.75rem' }} title="Ping Location">
                  <MapPin size={18} />
                </button>
              </div>
              <span className="text-xs text-muted mt-2 d-flex align-center gap-2">
                <AlertCircle size={14} /> Coordinates are strictly used for optimization engine heuristics.
              </span>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              <Target size={18} /> INITIATE DEPLOYMENT ASSIGNMENT
            </button>
          </form>
        </div>
      ) : (
        <div className="slide-in">
          {!assignedTask ? (
            <div className="panel text-center" style={{ padding: '4rem 2rem' }}>
              <div className="mb-4" style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
                <Compass size={40} color="var(--accent-blue)" className="pulse-dot" style={{ boxShadow: 'none' }} />
              </div>
              <h3>Optimization Node Active</h3>
              <p className="text-muted text-sm">Calculating route efficiencies against existing grid saturation...</p>
            </div>
          ) : (
            <div className="panel" style={{ borderTop: '4px solid var(--accent-emerald)' }}>
              <div className="text-center mb-4 mt-2">
                <CheckCircle2 size={42} color="var(--accent-emerald)" style={{ marginBottom: '0.5rem' }} />
                <h2 style={{ fontSize: '1.5rem' }}>Routing Established</h2>
                <p className="text-sm text-muted">A critical gap has been detected matching your capabilities.</p>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div className="d-flex justify-between mb-2 align-center">
                  <span className="font-bold text-sm" style={{ fontFamily: 'monospace' }}>{assignedTask.id}</span>
                  <span className="badge badge-critical">{assignedTask.urgency}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{assignedTask.title}</h3>
                <div className="d-flex align-center gap-2 text-sm text-muted" style={{ fontFamily: 'monospace' }}>
                  <MapPin size={14} color="var(--accent-blue)" />
                  <span>{assignedTask.location}</span>
                </div>
              </div>

              <div className="d-flex gap-4 mb-4">
                <div className="panel w-full text-center" style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>Distance</div>
                  <div className="font-bold" style={{ fontSize: '1.1rem' }}>{assignedTask.distance}</div>
                </div>
                <div className="panel w-full text-center" style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>Travel Time</div>
                  <div className="font-bold" style={{ fontSize: '1.1rem' }}>{assignedTask.estimatedTravelTime}</div>
                </div>
                <div className="panel w-full text-center" style={{ padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div className="text-xs text-muted mb-1" style={{ textTransform: 'uppercase' }}>Impact Metric</div>
                  <div className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--accent-emerald)' }}>{assignedTask.impactScore} / 100</div>
                </div>
              </div>

              <button className="btn btn-success w-full">
                <Navigation size={18} /> TRANSMIT & OPEN ROUTE
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerPortal;
