import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, AlertTriangle, Users, Anchor, ChevronRight } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  
  // API State
  const [personnel, setPersonnel] = useState(0);
  const [demandData, setDemandData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [avgTime, setAvgTime] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [fleetUtil, setFleetUtil] = useState(0);

  // Fetch from Python Backend Local Proxy
  useEffect(() => {
    let interval;
    const fetchApiData = async () => {
      try {
        const statsRes = await fetch('/api/dashboard/stats');
        if (statsRes.ok) {
           const stats = await statsRes.json();
           setPersonnel(stats.personnel);
           setAvgTime(stats.avgDispatchTime);
           setCriticalCount(stats.criticalIncidents);
           setFleetUtil(stats.fleetUtilization);
           setDemandData(stats.demandData);
           setAllocationData(stats.allocationData);
        }

        const incidentsRes = await fetch('/api/incidents/active');
        if (incidentsRes.ok) {
           const incData = await incidentsRes.json();
           setActiveIncidents(incData.incidents);
        }
      } catch (err) {
        console.error("Backend offline. Make sure uvicorn is running:", err);
      }
    };
    
    // Initial fetch
    fetchApiData();

    if (simulationActive) {
      interval = setInterval(fetchApiData, 3000); 
    }
    return () => clearInterval(interval);
  }, [simulationActive]);

  const StatCard = ({ title, value, icon, target, unit, type = 'default' }) => (
    <div className="panel slide-in d-flex flex-column justify-between" style={{ flex: 1, minWidth: '200px' }}>
      <div className="d-flex justify-between align-center mb-2">
        <span className="text-muted text-sm font-bold" style={{ textTransform: 'uppercase' }}>{title}</span>
        <div style={{ color: type === 'warning' ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
          {icon}
        </div>
      </div>
      <div className="d-flex align-center gap-2">
        <h2 style={{ fontSize: '1.75rem', margin: 0 }}>{value}</h2>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>
      {target && (
         <div className="text-xs text-muted mt-2">
           vs Target: {target}
         </div>
      )}
    </div>
  );

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Area Command Summary (India Node)</h1>
          <p className="text-sm text-muted">ID: IND-DEL-ALPHA | Local Time: {new Date().toLocaleTimeString('en-US', { hour12: false })}</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline">Export Report</button>
          <button 
            className={`btn ${simulationActive ? 'btn-success' : 'btn-primary'}`}
            onClick={() => setSimulationActive(!simulationActive)}
          >
            {simulationActive ? 'Optimization Engine: ACTIVE' : 'Start Auto-Routing'}
          </button>
        </div>
      </div>

      <div className="d-flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
        <StatCard title="Active Personnel" value={personnel || "--"} icon={<Users size={18} />} target="150" />
        <StatCard title="Avg Dispatch Time" value={avgTime || "--"} unit="mins" icon={<Activity size={18} />} target="2.0 mins" />
        <StatCard title="Critical Incidents" value={criticalCount || "--"} icon={<AlertTriangle size={18} />} type="warning" />
        <StatCard title="Fleet Utilization" value={fleetUtil || "--"} unit="%" icon={<Anchor size={18} />} target="80%" />
      </div>

      <div className="d-flex gap-4 mb-4">
        {/* Map Widget via Leaflet */}
        <div className="panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', height: '400px' }}>
          <div className="panel-header d-flex justify-between align-center" style={{ margin: 0, padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
            <span className="text-sm font-bold">Tactical Satellite Overlay (NCR)</span>
            <div className="d-flex gap-2 align-center">
              <span className="pulse-dot"></span>
              <span className="text-xs text-muted">Live Tracking</span>
            </div>
          </div>
          <div style={{ flex: 1, background: '#1a1a1a', position: 'relative' }}>
            <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />
              {activeIncidents.map(inc => (
                <Circle 
                  key={inc.id} 
                  center={[inc.lat, inc.lon]} 
                  pathOptions={{ 
                    fillColor: inc.status === 'Critical' ? '#ef4444' : '#f59e0b', 
                    color: inc.status === 'Critical' ? '#ef4444' : '#f59e0b', 
                    fillOpacity: 0.2 
                  }} 
                  radius={inc.status === 'Critical' ? 2000 : 1500}
                >
                  <Popup>{inc.id} ({inc.status})</Popup>
                </Circle>
              ))}
              {/* Squad Marker - Safdarjung area */}
              <Marker position={[28.5677, 77.2060]}>
                <Popup>Unit Alpha-1 Tracking</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {/* Impact Metrics Area Chart */}
        <div className="panel" style={{ flex: 1, height: '400px', display: 'flex', flexDirection: 'column' }}>
           <div className="panel-header text-sm font-bold">Response Lag Time Overview</div>
           <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={demandData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--bg-tertiary)" stopOpacity={0.5}/>
                     <stop offset="95%" stopColor="var(--bg-tertiary)" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.5}/>
                     <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                 <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                 <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                 />
                 <Area type="monotone" dataKey="manual" stroke="var(--text-muted)" fill="url(#colorManual)" name="Manual Allocation (mins)" />
                 <Area type="monotone" dataKey="optimized" stroke="var(--accent-blue)" fill="url(#colorOpt)" strokeWidth={2} name="AI Optimized (mins)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="d-flex gap-4">
        {/* Active Incidents Data Log */}
        <div className="panel" style={{ flex: 2 }}>
          <div className="panel-header d-flex justify-between align-center">
            <span className="text-sm font-bold">Active Incident Log (Backend Feed)</span>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Type</th>
                <th>Grid Loc</th>
                <th>Units</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activeIncidents.map((inc) => (
                <tr key={inc.id}>
                  <td className="font-bold">{inc.id}</td>
                  <td>{inc.title}</td>
                  <td className="text-muted" style={{ fontFamily: 'monospace' }}>{inc.loc_name}</td>
                  <td>{inc.units}</td>
                  <td>
                    <span className={`badge ${inc.status === 'Critical' ? 'badge-critical' : inc.status === 'Warning' ? 'badge-warning' : 'badge-active'}`}>
                      {inc.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resource Distribution */}
        <div className="panel" style={{ flex: 1 }}>
          <div className="panel-header text-sm font-bold">Sector Deployment</div>
          <div style={{ height: '220px' }}>
             {allocationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allocationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="zone" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="required" fill="var(--bg-tertiary)" name="Required" radius={[0, 2, 2, 0]} barSize={12} />
                    <Bar dataKey="allocated" fill="var(--accent-emerald)" name="Deployed" radius={[0, 2, 2, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Loading AI Engine...</div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
