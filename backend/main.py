from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import math
import random
import time

app = FastAPI(title="VolunteerFlow C2 API", version="1.0.1")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Permanent Database
def init_db():
    conn = sqlite3.connect("volunteer_flow.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS volunteers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT,
            capability TEXT,
            lat REAL,
            lon REAL,
            assigned_task_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Realistic Data localized for New Delhi, India
active_incidents = [
    {"id": "INC-2026-891A", "title": "Medical Emergency", "lat": 28.6304, "lon": 77.2177, "status": "Critical", "units": 3, "loc_name": "Connaught Place"},
    {"id": "INC-2026-891B", "title": "Evacuation Route Blocked", "lat": 28.5245, "lon": 77.1855, "status": "Active", "units": 1, "loc_name": "Qutub Minar"},
    {"id": "INC-2026-891C", "title": "Supply Drop Required", "lat": 28.5355, "lon": 77.2639, "status": "Warning", "units": 2, "loc_name": "Okhla Industrial Area"},
    {"id": "INC-2026-892A", "title": "Structural Collapse", "lat": 28.5562, "lon": 77.2065, "status": "Critical", "units": 4, "loc_name": "Hauz Khas"},
]

# Models
class VolunteerRegistration(BaseModel):
    name: str
    phone: str
    capability: str
    lat: float
    lon: float

# Helpers
def calculate_distance(lat1, lon1, lat2, lon2):
    dx = (lat2 - lat1) * 111.0
    dy = (lon2 - lon1) * 111.0 * math.cos(math.radians((lat1 + lat2) / 2.0))
    return math.sqrt(dx**2 + dy**2)

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    personnel = 124 + random.randint(-5, 10)
    return {
        "personnel": personnel,
        "avgDispatchTime": round(random.uniform(1.0, 1.8), 1),
        "criticalIncidents": len([i for i in active_incidents if i["status"] == "Critical"]),
        "fleetUtilization": random.randint(78, 92),
        "demandData": [
            {"time": "08:00", "manual": 42, "optimized": 28},
            {"time": "09:00", "manual": 58, "optimized": 35},
            {"time": "10:00", "manual": 64, "optimized": 41},
            {"time": "11:00", "manual": 81, "optimized": 45},
            {"time": "12:00", "manual": 95, "optimized": 52},
            {"time": "13:00", "manual": 104, "optimized": 48},
        ],
        "allocationData": [
            {"zone": "North Ex (Central)", "allocated": 45, "required": 50},
            {"zone": "Okhla Ind (South)", "allocated": 80, "required": 85},
            {"zone": "Dwarka (South-West)", "allocated": 30, "required": 60},
            {"zone": "Noida (East Grid)", "allocated": 55, "required": 50},
        ]
    }

@app.get("/api/incidents/active")
def get_active_incidents():
    return {"incidents": active_incidents}

@app.get("/api/volunteers")
def get_stored_volunteers():
    """Returns exactly who is stored inside the database for validation proofs."""
    conn = sqlite3.connect("volunteer_flow.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM volunteers ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.post("/api/volunteer/assign")
def assign_volunteer(payload: VolunteerRegistration):
    time.sleep(1.5) # Simulate algorithm computing speed
    
    capability_weights = {
        "medical": "Medical Emergency",
        "logistics": "Supply Drop Required",
        "rescue": "Structural Collapse",
        "general": "Evacuation Route Blocked"
    }
    preferred_title = capability_weights.get(payload.capability, None)
    
    best_task = None
    best_score = -1
    best_dist = 9999.0
    
    for incident in active_incidents:
        dist = calculate_distance(payload.lat, payload.lon, incident["lat"], incident["lon"])
        impact = max(0, 100 - int((dist / 10.0) * 50)) 
        
        if incident["title"] == preferred_title:
            impact += 25
        if incident["status"] == "Critical":
            impact += 15
            
        impact = min(100, impact)
        
        if impact > best_score or (impact == best_score and dist < best_dist):
            best_score = impact
            best_dist = dist
            best_task = incident

    if not best_task:
        raise HTTPException(status_code=404, detail="No tasks match optimal bounds.")

    # ------------------ PERSISTENCE LAYER ------------------
    # Save the agent and their mathematically assigned task to the DB
    conn = sqlite3.connect("volunteer_flow.db")
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO volunteers (name, phone, capability, lat, lon, assigned_task_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (payload.name, payload.phone, payload.capability, payload.lat, payload.lon, best_task["id"]))
    conn.commit()
    conn.close()
    # -------------------------------------------------------

    return {
        "id": best_task["id"],
        "title": best_task["title"],
        "location": f"{best_task['loc_name']} // Lat: {best_task['lat']:.3f}, Lon: {best_task['lon']:.3f}",
        "distance": f"{best_dist:.1f} km",
        "urgency": best_task["status"],
        "estimatedTravelTime": f"{int((best_dist / 30.0) * 60)} mins (Optimized)", 
        "impactScore": best_score
    }
