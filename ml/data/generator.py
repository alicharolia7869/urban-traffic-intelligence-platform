"""
Realistic Synthetic Traffic Dataset Generator for Urban Traffic Intelligence Platform.
Generates:
- 105+ unique roads with realistic geometries, road classes, capacities, and network connections.
- 120,000+ traffic readings spanning multiple weeks and months.
- Multimodal vehicle counts (cars, motorcycles, buses, trucks, commercial, other).
- Correlated weather events and active/historical incidents.
- Congestion propagation along connected road corridors.
- Normalized congestion scores (0-100) with standard application thresholds.
"""
import os
import json
import sqlite3
import random
import math
from datetime import datetime, timedelta
import numpy as np

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "database", "traffic.db"))
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

# Metro City Coordinates (Centroid: 19.0760, 72.8777 - Coastal Metropolis)
CENTER_LAT = 19.0760
CENTER_LNG = 72.8777

ROAD_NAMES_TEMPLATES = [
    ("Western Express Highway", "Expressway", "North Corridor", 6, 80.0, 4800),
    ("Eastern Freeway", "Expressway", "Harbor District", 6, 80.0, 4500),
    ("Coastal Marine Boulevard", "Boulevard", "Central Business District", 4, 60.0, 3200),
    ("Central Metro Ring Road", "Expressway", "Central Business District", 6, 70.0, 4200),
    ("Silicon Tech Corridor", "Arterial", "Tech Hub", 4, 50.0, 2800),
    ("Airport Skyway Connector", "Expressway", "Airport Corridor", 4, 80.0, 3600),
    ("Harbor Bridge Crossing", "Expressway", "Harbor District", 6, 70.0, 4600),
    ("North-South Arterial Axis", "Arterial", "North Corridor", 4, 50.0, 2600),
    ("Grand Avenue Promenade", "Boulevard", "Central Business District", 4, 45.0, 2200),
    ("Industrial Belt Road", "Collector", "West Suburbs", 4, 50.0, 2400),
    ("University Circle Boulevard", "Collector", "West Suburbs", 2, 40.0, 1600),
    ("Cyber City Link Road", "Arterial", "Tech Hub", 4, 50.0, 2700),
    ("Old Town Heritage Street", "Collector", "Central Business District", 2, 35.0, 1400),
    ("Midtown Central Parkway", "Boulevard", "Central Business District", 4, 55.0, 3000),
    ("East Bay Expressway", "Expressway", "Harbor District", 6, 85.0, 5000),
    ("Financial District Spine", "Arterial", "Central Business District", 4, 45.0, 2500),
    ("Highland Ridge Bypass", "Expressway", "West Suburbs", 4, 75.0, 3400),
    ("Suburban Cross Connector", "Collector", "North Corridor", 4, 50.0, 2200),
    ("Terminal 2 Transit Way", "Arterial", "Airport Corridor", 4, 60.0, 2900),
    ("Bayview Esplanade", "Boulevard", "Harbor District", 4, 50.0, 2400),
    ("Valley Interchange Spur", "Expressway", "West Suburbs", 4, 70.0, 3100),
    ("Metro Station Plaza Road", "Collector", "Central Business District", 2, 35.0, 1300),
    ("Outer Ring Peripheral Way", "Expressway", "North Corridor", 6, 85.0, 4800),
    ("Riverfront Drive", "Boulevard", "Harbor District", 4, 50.0, 2500),
    ("Innovation Parkway", "Arterial", "Tech Hub", 4, 55.0, 2900),
]

WEATHER_CONDITIONS = [
    ("Clear", 28.5, 0.0, 55.0, 10.0, 12.0),
    ("Clear", 31.0, 0.0, 48.0, 10.0, 15.0),
    ("Overcast", 26.0, 0.2, 70.0, 8.5, 18.0),
    ("Light Rain", 24.5, 3.8, 85.0, 5.0, 22.0),
    ("Heavy Rain", 22.0, 18.5, 96.0, 2.0, 34.0),
    ("Thunderstorm", 21.0, 28.0, 98.0, 1.2, 42.0),
    ("Fog", 19.5, 0.0, 92.0, 1.5, 8.0),
]

INCIDENT_TYPES = ["Accident", "Road Work", "Road Closure", "Vehicle Breakdown", "Public Event"]


def generate_roads(num_roads=110):
    roads = []
    num_templates = len(ROAD_NAMES_TEMPLATES)
    
    for i in range(num_roads):
        road_id = f"RD-{i+1:03d}"
        tpl = ROAD_NAMES_TEMPLATES[i % num_templates]
        suffix = f" Segment {i // num_templates + 1}" if i >= num_templates else ""
        name = f"{tpl[0]}{suffix}"
        road_type = tpl[1]
        district = tpl[2]
        lanes = tpl[3]
        speed_limit = tpl[4]
        capacity_vph = tpl[5]
        
        # Coordinates in realistic clustered layout around metropolis
        angle = (i / num_roads) * 2 * math.pi
        radius = 0.04 + (i % 7) * 0.015 + random.uniform(-0.008, 0.008)
        
        start_lat = CENTER_LAT + radius * math.sin(angle)
        start_lng = CENTER_LNG + radius * math.cos(angle) * 1.05
        
        # Segment length 1.2 to 5.5 km
        length_km = round(random.uniform(1.4, 5.2), 2)
        d_lat = (length_km / 111.0) * math.sin(angle + 0.3)
        d_lng = (length_km / (111.0 * math.cos(math.radians(CENTER_LAT)))) * math.cos(angle + 0.3)
        
        end_lat = start_lat + d_lat
        end_lng = start_lng + d_lng
        
        # Polyline with 3-4 points for curvature
        mid_lat = (start_lat + end_lat) / 2 + random.uniform(-0.003, 0.003)
        mid_lng = (start_lng + end_lng) / 2 + random.uniform(-0.003, 0.003)
        coords = [
            [round(start_lat, 5), round(start_lng, 5)],
            [round(mid_lat, 5), round(mid_lng, 5)],
            [round(end_lat, 5), round(end_lng, 5)]
        ]
        
        # Connected road IDs (network topology)
        connected = []
        if i > 0:
            connected.append(f"RD-{i:03d}")
        if i < num_roads - 1:
            connected.append(f"RD-{i+2:03d}")
        # Add a cross-corridor connection
        cross_id = f"RD-{(i + 17) % num_roads + 1:03d}"
        if cross_id != road_id and cross_id not in connected:
            connected.append(cross_id)
            
        roads.append({
            "road_id": road_id,
            "name": name,
            "district": district,
            "road_type": road_type,
            "length_km": length_km,
            "lanes": lanes,
            "speed_limit": speed_limit,
            "capacity_vph": capacity_vph,
            "start_lat": round(start_lat, 5),
            "start_lng": round(start_lng, 5),
            "end_lat": round(end_lat, 5),
            "end_lng": round(end_lng, 5),
            "coordinates_json": json.dumps(coords),
            "connected_roads_json": json.dumps(connected)
        })
    return roads


def compute_congestion_score(density_vpk, speed_ratio, occupancy):
    """
    Standard application normalized congestion score from 0 to 100.
    - speed_ratio: avg_speed / speed_limit (1.0 = free flow, 0.2 = severe crawl)
    - density_vpk: vehicles per km (0 - 150)
    - occupancy: road occupancy % (0 - 100)
    """
    speed_factor = max(0.0, min(1.0, (1.0 - speed_ratio))) * 45.0  # up to 45 pts
    occ_factor = max(0.0, min(1.0, occupancy / 100.0)) * 35.0      # up to 35 pts
    density_factor = max(0.0, min(1.0, density_vpk / 120.0)) * 20.0 # up to 20 pts
    
    score = speed_factor + occ_factor + density_factor
    score = max(5.0, min(99.0, score))
    return round(score, 1)


def score_to_level(score):
    if score <= 20.0:
        return "LOW"
    elif score <= 40.0:
        return "LIGHT"
    elif score <= 60.0:
        return "MODERATE"
    elif score <= 80.0:
        return "HEAVY"
    else:
        return "SEVERE"


def generate_dataset(total_readings_target=125000):
    print("Generating roads...")
    roads = generate_roads(110)
    road_map = {r["road_id"]: r for r in roads}
    
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Enable WAL mode for high performance
    cur.execute("PRAGMA journal_mode = WAL;")
    cur.execute("PRAGMA synchronous = NORMAL;")
    
    # Create tables
    cur.execute("""
    CREATE TABLE IF NOT EXISTS roads (
        road_id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        district VARCHAR(64) NOT NULL,
        road_type VARCHAR(32) NOT NULL,
        length_km REAL NOT NULL,
        lanes INTEGER NOT NULL,
        speed_limit REAL NOT NULL,
        capacity_vph INTEGER NOT NULL,
        start_lat REAL NOT NULL,
        start_lng REAL NOT NULL,
        end_lat REAL NOT NULL,
        end_lng REAL NOT NULL,
        coordinates_json TEXT NOT NULL,
        connected_roads_json TEXT NOT NULL
    )""")
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS traffic_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        road_id VARCHAR(32) NOT NULL,
        timestamp DATETIME NOT NULL,
        vehicle_count INTEGER NOT NULL,
        avg_speed REAL NOT NULL,
        occupancy REAL NOT NULL,
        travel_time_sec REAL NOT NULL,
        density_vpk REAL NOT NULL,
        congestion_score REAL NOT NULL,
        congestion_level VARCHAR(16) NOT NULL
    )""")
    
    cur.execute("CREATE INDEX IF NOT EXISTS idx_road_timestamp ON traffic_readings (road_id, timestamp);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_congestion_level ON traffic_readings (congestion_level);")
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS weather (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME NOT NULL,
        condition VARCHAR(32) NOT NULL,
        temperature_c REAL NOT NULL,
        rainfall_mm REAL NOT NULL,
        humidity_pct REAL NOT NULL,
        visibility_km REAL NOT NULL,
        wind_speed_kmh REAL NOT NULL
    )""")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_weather_timestamp ON weather (timestamp);")
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR(32) PRIMARY KEY,
        road_id VARCHAR(32) NOT NULL,
        incident_type VARCHAR(32) NOT NULL,
        severity VARCHAR(16) NOT NULL,
        description TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        estimated_end_time DATETIME,
        lanes_blocked INTEGER NOT NULL,
        speed_impact_pct REAL NOT NULL,
        status VARCHAR(16) NOT NULL
    )""")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_incident_road ON incidents (road_id);")
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        road_id VARCHAR(32) NOT NULL,
        timestamp DATETIME NOT NULL,
        cars INTEGER NOT NULL,
        motorcycles INTEGER NOT NULL,
        buses INTEGER NOT NULL,
        trucks INTEGER NOT NULL,
        commercial INTEGER NOT NULL,
        other INTEGER NOT NULL,
        total_vehicles INTEGER NOT NULL
    )""")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_vehicle_road_ts ON vehicle_data (road_id, timestamp);")
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        road_id VARCHAR(32) NOT NULL,
        generated_at DATETIME NOT NULL,
        horizon_minutes INTEGER NOT NULL,
        predicted_score REAL NOT NULL,
        predicted_level VARCHAR(16) NOT NULL,
        confidence REAL NOT NULL,
        risk_level VARCHAR(16) NOT NULL,
        factors_json TEXT NOT NULL,
        explanation TEXT NOT NULL
    )""")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_predictions_road ON predictions (road_id);")
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS model_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name VARCHAR(64) NOT NULL,
        horizon_minutes INTEGER NOT NULL,
        mae REAL NOT NULL,
        rmse REAL NOT NULL,
        r2 REAL NOT NULL,
        accuracy REAL NOT NULL,
        precision REAL NOT NULL,
        recall REAL NOT NULL,
        f1_score REAL NOT NULL,
        updated_at DATETIME NOT NULL
    )""")
    
    # Clear existing data for fresh clean generation
    cur.execute("DELETE FROM roads;")
    cur.execute("DELETE FROM traffic_readings;")
    cur.execute("DELETE FROM weather;")
    cur.execute("DELETE FROM incidents;")
    cur.execute("DELETE FROM vehicle_data;")
    cur.execute("DELETE FROM predictions;")
    cur.execute("DELETE FROM model_metrics;")
    
    # Insert roads
    print(f"Inserting {len(roads)} roads...")
    cur.executemany("""
    INSERT INTO roads (road_id, name, district, road_type, length_km, lanes, speed_limit, capacity_vph,
                       start_lat, start_lng, end_lat, end_lng, coordinates_json, connected_roads_json)
    VALUES (:road_id, :name, :district, :road_type, :length_km, :lanes, :speed_limit, :capacity_vph,
            :start_lat, :start_lng, :end_lat, :end_lng, :coordinates_json, :connected_roads_json)
    """, roads)
    conn.commit()
    
    # Generate time series
    # 110 roads. To get ~125,000 readings: 125,000 / 110 ≈ 1,140 time steps (approx 47 days at hourly, or 12 days at 15-min intervals)
    # Let's generate 14 days of 15-minute readings: 14 * 24 * 4 = 1,344 timestamps. 1,344 * 110 = 147,840 readings!
    print("Generating timestamps and weather series...")
    now = datetime(2026, 9, 29, 12, 0, 0)
    start_time = now - timedelta(days=14)
    
    time_steps = []
    t = start_time
    while t <= now:
        time_steps.append(t)
        t += timedelta(minutes=15)
        
    num_steps = len(time_steps)
    print(f"Total time steps: {num_steps} (from {time_steps[0]} to {time_steps[-1]})")
    
    # Pre-generate weather series
    weather_records = []
    weather_at_step = []
    current_weather_idx = 0
    weather_hold_steps = 16  # weather changes every ~4 hours
    
    for i, ts in enumerate(time_steps):
        if i % weather_hold_steps == 0:
            # Pick next weather with weighted transition
            weights = [0.45, 0.25, 0.12, 0.08, 0.05, 0.03, 0.02]
            current_weather_idx = random.choices(range(len(WEATHER_CONDITIONS)), weights=weights)[0]
        
        w_tpl = WEATHER_CONDITIONS[current_weather_idx]
        cond = w_tpl[0]
        temp = round(w_tpl[1] + random.uniform(-1.5, 1.5), 1)
        rain = round(max(0.0, w_tpl[2] + random.uniform(-0.5, 1.5)), 1) if w_tpl[2] > 0 else 0.0
        hum = round(min(100.0, max(30.0, w_tpl[3] + random.uniform(-3, 3))), 1)
        vis = round(max(0.5, w_tpl[4] + random.uniform(-0.5, 0.5)), 1)
        wind = round(max(2.0, w_tpl[5] + random.uniform(-3, 4)), 1)
        
        weather_at_step.append((cond, rain, vis))
        weather_records.append((
            ts.strftime("%Y-%m-%d %H:%M:%S"),
            cond, temp, rain, hum, vis, wind
        ))
        
    cur.executemany("""
    INSERT INTO weather (timestamp, condition, temperature_c, rainfall_mm, humidity_pct, visibility_km, wind_speed_kmh)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, weather_records)
    conn.commit()
    print("Weather series inserted.")
    
    # Generate Incidents (active and historical)
    incidents = []
    # 25 historical and active incidents
    for inc_i in range(35):
        inc_id = f"INC-{1000 + inc_i}"
        target_road = random.choice(roads)
        inc_type = random.choice(INCIDENT_TYPES)
        severity = random.choice(["Low", "Medium", "High", "Critical"])
        
        # Some are active in the last 4 hours
        if inc_i < 8:
            inc_start = now - timedelta(minutes=random.randint(15, 180))
            inc_end = inc_start + timedelta(minutes=random.randint(45, 180))
            status = "Active"
        else:
            days_ago = random.randint(1, 13)
            inc_start = now - timedelta(days=days_ago, hours=random.randint(1, 23))
            inc_end = inc_start + timedelta(minutes=random.randint(45, 240))
            status = "Resolved"
            
        lanes_blocked = min(target_road["lanes"], random.randint(1, 2))
        speed_impact = random.choice([25.0, 40.0, 60.0, 75.0])
        desc = f"{severity} {inc_type} on {target_road['name']} blocking {lanes_blocked} lane(s)."
        
        incidents.append((
            inc_id, target_road["road_id"], inc_type, severity, desc,
            inc_start.strftime("%Y-%m-%d %H:%M:%S"),
            inc_end.strftime("%Y-%m-%d %H:%M:%S"),
            lanes_blocked, speed_impact, status
        ))
        
    cur.executemany("""
    INSERT INTO incidents (id, road_id, incident_type, severity, description, start_time, estimated_end_time,
                          lanes_blocked, speed_impact_pct, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, incidents)
    conn.commit()
    print("Incidents inserted.")
    
    # Generate Traffic Readings and Vehicle Data
    print("Generating correlated traffic and vehicle records...")
    readings_batch = []
    vehicle_batch = []
    
    # For propagation tracking
    active_incident_roads = {inc[1]: inc[8] for inc in incidents if inc[9] == "Active"}
    
    # Batch size
    BATCH_SIZE = 25000
    total_generated = 0
    
    for step_idx, ts in enumerate(time_steps):
        hour = ts.hour
        minute = ts.minute
        weekday = ts.weekday()  # 0=Monday, 6=Sunday
        is_weekend = 1 if weekday >= 5 else 0
        
        # Rush hour curves
        # Morning rush: 7:30 to 9:45
        # Evening rush: 17:00 to 20:00
        # Lunch surge: 12:30 to 14:00
        time_decimal = hour + minute / 60.0
        
        if not is_weekend:
            m_rush = math.exp(-((time_decimal - 8.5) ** 2) / 1.8)
            e_rush = math.exp(-((time_decimal - 18.2) ** 2) / 2.2)
            l_rush = math.exp(-((time_decimal - 13.0) ** 2) / 1.5) * 0.4
            base_curve = 0.15 + 0.55 * m_rush + 0.65 * e_rush + l_rush
        else:
            # Weekend peak around 13:00 - 19:00
            weekend_curve = math.exp(-((time_decimal - 15.5) ** 2) / 10.0)
            base_curve = 0.20 + 0.55 * weekend_curve
            
        weather_cond, rainfall, visibility = weather_at_step[step_idx]
        
        # Rain speed reduction factor (10% to 35% drop in speed)
        rain_speed_penalty = 1.0
        if rainfall > 15.0:
            rain_speed_penalty = 0.65  # Heavy rain: 35% speed drop
        elif rainfall > 3.0:
            rain_speed_penalty = 0.82  # Light rain: 18% speed drop
        elif rainfall > 0.0:
            rain_speed_penalty = 0.92
            
        ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")
        
        for road in roads:
            rid = road["road_id"]
            cap = road["capacity_vph"]
            limit = road["speed_limit"]
            length = road["length_km"]
            lanes = road["lanes"]
            
            # Road class multiplier
            road_type = road["road_type"]
            type_mult = 1.15 if road_type == "Expressway" else (1.0 if road_type == "Arterial" else 0.85)
            
            # Check incident
            has_incident = rid in active_incident_roads and step_idx >= (num_steps - 16)
            incident_penalty = (100.0 - active_incident_roads[rid]) / 100.0 if has_incident else 1.0
            
            # Flow factor (vehicles)
            random_noise = random.uniform(0.85, 1.15)
            # Hourly capacity scaled to 15-min interval
            expected_15min_vol = (cap / 4.0) * base_curve * type_mult * random_noise
            vehicle_count = int(max(15, min(cap * 0.45, expected_15min_vol)))
            
            # Density (vehicles per km on road segment)
            density_vpk = round(max(3.0, (vehicle_count / length) / lanes), 1)
            
            # Speed reduction based on volume-to-capacity and weather/incidents
            v_c_ratio = min(1.2, (vehicle_count * 4.0) / cap)
            
            # Fundamental traffic diagram speed curve
            speed_ratio = max(0.18, 1.0 - 0.75 * (v_c_ratio ** 1.8))
            avg_speed = round(max(12.0, limit * speed_ratio * rain_speed_penalty * incident_penalty), 1)
            
            # Occupancy %
            occupancy = round(min(98.0, max(5.0, (density_vpk / (lanes * 35.0)) * 100.0)), 1)
            
            # Travel time
            travel_time_sec = round((length / max(avg_speed, 5.0)) * 3600.0, 1)
            
            # Congestion score & level
            c_score = compute_congestion_score(density_vpk, avg_speed / limit, occupancy)
            c_level = score_to_level(c_score)
            
            readings_batch.append((
                rid, ts_str, vehicle_count, avg_speed, occupancy, travel_time_sec, density_vpk, c_score, c_level
            ))
            
            # Multimodal vehicle breakdown
            # Cars (50-65%), Motorcycles (20-35%), Buses (4-8%), Trucks (3-10%), Commercial (4-8%), Other (1-3%)
            car_ratio = random.uniform(0.50, 0.62)
            moto_ratio = random.uniform(0.20, 0.32)
            bus_ratio = random.uniform(0.04, 0.08)
            truck_ratio = random.uniform(0.02, 0.08) if road_type != "Boulevard" else 0.01
            comm_ratio = random.uniform(0.03, 0.07)
            
            cars = int(vehicle_count * car_ratio)
            motorcycles = int(vehicle_count * moto_ratio)
            buses = int(vehicle_count * bus_ratio)
            trucks = int(vehicle_count * truck_ratio)
            commercial = int(vehicle_count * comm_ratio)
            other = max(1, vehicle_count - (cars + motorcycles + buses + trucks + commercial))
            total_v = cars + motorcycles + buses + trucks + commercial + other
            
            vehicle_batch.append((
                rid, ts_str, cars, motorcycles, buses, trucks, commercial, other, total_v
            ))
            
            if len(readings_batch) >= BATCH_SIZE:
                cur.executemany("""
                INSERT INTO traffic_readings (road_id, timestamp, vehicle_count, avg_speed, occupancy,
                                              travel_time_sec, density_vpk, congestion_score, congestion_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, readings_batch)
                
                cur.executemany("""
                INSERT INTO vehicle_data (road_id, timestamp, cars, motorcycles, buses, trucks, commercial, other, total_vehicles)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, vehicle_batch)
                conn.commit()
                total_generated += len(readings_batch)
                print(f"Inserted {total_generated} readings...")
                readings_batch = []
                vehicle_batch = []

    if readings_batch:
        cur.executemany("""
        INSERT INTO traffic_readings (road_id, timestamp, vehicle_count, avg_speed, occupancy,
                                      travel_time_sec, density_vpk, congestion_score, congestion_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, readings_batch)
        cur.executemany("""
        INSERT INTO vehicle_data (road_id, timestamp, cars, motorcycles, buses, trucks, commercial, other, total_vehicles)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, vehicle_batch)
        conn.commit()
        total_generated += len(readings_batch)

    print(f"Finished generating {total_generated} traffic readings and vehicle logs!")
    conn.close()


if __name__ == "__main__":
    generate_dataset()
