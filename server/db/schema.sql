-- ArogyaNet Schema Definition
-- Drop views first
DROP VIEW IF EXISTS dashboard_overview_view;
DROP VIEW IF EXISTS logistics_summary;
DROP VIEW IF EXISTS all_logistics;

-- Drop tables
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS command_center_alerts;
DROP TABLE IF EXISTS footfall_logs;
DROP TABLE IF EXISTS sanctioned_strength;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS daily_logs;
DROP TABLE IF EXISTS logistics;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS facilities;

-- 1. Facilities
CREATE TABLE facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    total_beds INTEGER DEFAULT 0,
    critical_alerts INTEGER DEFAULT 0,
    footfall_avg INTEGER DEFAULT 0
);

-- 2. Users
CREATE TABLE users (
    username VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    center_id VARCHAR(50) REFERENCES facilities(id)
);

-- 3. Logistics (Inventory)
CREATE TABLE logistics (
    id SERIAL PRIMARY KEY,
    center_id VARCHAR(50) REFERENCES facilities(id),
    category VARCHAR(50) NOT NULL,
    itemPayload JSONB NOT NULL
);

-- 4. Daily Logs
CREATE TABLE daily_logs (
    id SERIAL PRIMARY KEY,
    center_id VARCHAR(50) REFERENCES facilities(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL,
    item_name VARCHAR(255),
    qty_or_notes TEXT
);

-- 5. Attendance
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    center_id VARCHAR(50) REFERENCES facilities(id),
    staff_name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    duty_hours INTEGER DEFAULT 0,
    leaves INTEGER DEFAULT 0,
    overtime INTEGER DEFAULT 0,
    department VARCHAR(100),
    patients_treated INTEGER DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sanctioned Strength (Uses JSONB to perfectly mimic the nested structure required by the frontend/AI)
CREATE TABLE sanctioned_strength (
    data JSONB NOT NULL
);

-- 7. Footfall Logs
CREATE TABLE footfall_logs (
    id SERIAL PRIMARY KEY,
    center_id VARCHAR(50) REFERENCES facilities(id),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    patient_count INTEGER,
    event_name VARCHAR(255),
    expected_attendance INTEGER,
    disease_type VARCHAR(255),
    reason_for_visit TEXT
);

-- 8. Command Center Alerts
CREATE TABLE command_center_alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100),
    severity VARCHAR(50),
    description TEXT,
    source_facility VARCHAR(50) REFERENCES facilities(id),
    broadcasted BOOLEAN DEFAULT FALSE,
    broadcast_target VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_role VARCHAR(50),
    sender_name VARCHAR(100),
    content TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Referrals
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    phc_id VARCHAR(50) REFERENCES facilities(id),
    chc_id VARCHAR(50) REFERENCES facilities(id),
    patient_name VARCHAR(255),
    condition_desc TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- COMPATIBILITY VIEWS (Translates SQL to exact mock structures)
-- ==========================================================

CREATE OR REPLACE VIEW logistics_summary AS
SELECT 
    center_id,
    COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id)) FILTER (WHERE category = 'consumables'), '[]'::jsonb) as consumables,
    COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id)) FILTER (WHERE category = 'equipment'), '[]'::jsonb) as equipment,
    COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id)) FILTER (WHERE category = 'transport'), '[]'::jsonb) as transport,
    COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id)) FILTER (WHERE category = 'beds'), '[]'::jsonb) as beds
FROM logistics
GROUP BY center_id;

CREATE OR REPLACE VIEW all_logistics AS
SELECT jsonb_object_agg(center_id, center_data) as data
FROM (
    SELECT center_id, jsonb_build_object(
        'consumables', COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'consumables'), '[]'::jsonb),
        'equipment', COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'equipment'), '[]'::jsonb),
        'transport', COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'transport'), '[]'::jsonb),
        'beds', COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'beds'), '[]'::jsonb)
    ) as center_data
    FROM logistics
    GROUP BY center_id
) sub;

CREATE OR REPLACE VIEW dashboard_overview_view AS
SELECT 
    (SELECT COUNT(*)::INTEGER FROM facilities) as total_phcs,
    6248 as live_patients,
    78 as stock_health,
    (SELECT COUNT(*)::INTEGER FROM command_center_alerts WHERE broadcasted = false) as critical_alerts;


-- ==========================================================
-- SEED DATA (Populating the Hackathon Demo Data)
-- ==========================================================

INSERT INTO facilities (id, name, type, location, total_beds, critical_alerts, footfall_avg) VALUES
('PHC-NORTH', 'Primary Health Center (North)', 'PHC', 'Surya Nagar', 50, 1, 450),
('CHC-CENTRAL', 'Community Health Center (Central)', 'CHC', 'Kaveri District', 150, 0, 1200),
('PHC-EAST', 'Primary Health Center (East)', 'PHC', 'Indira Nagar', 30, 3, 210);

INSERT INTO users (username, password, role, center_id) VALUES
('admin', 'password', 'admin', NULL),
('phc-north', 'password', 'staff', 'PHC-NORTH'),
('chc-central', 'password', 'staff', 'CHC-CENTRAL'),
('mla_user', 'password', 'mla', NULL);

-- Logistics
INSERT INTO logistics (center_id, category, itemPayload) VALUES
('PHC-NORTH', 'consumables', '{"name": "Paracetamol 500mg", "category": "Medicine", "quantity": 400, "unit": "tablets", "threshold": 500, "expiry_date": "2027-01-01", "ai_trend": "Stable", "batch_number": "B-1001", "supplier": "PharmaCorp", "storage_conditions": "Room Temp"}'),
('PHC-NORTH', 'consumables', '{"name": "Amoxicillin 250mg", "category": "Medicine", "quantity": 20, "unit": "tablets", "threshold": 100, "expiry_date": "2026-10-01", "ai_trend": "High Demand Expected", "batch_number": "B-1002", "supplier": "MedLife", "storage_conditions": "Room Temp"}'),
('PHC-NORTH', 'consumables', '{"name": "Surgical Masks", "category": "Hygiene", "quantity": 50, "unit": "boxes", "threshold": 200, "expiry_date": "2028-05-12", "ai_trend": "Surging", "batch_number": "B-1003", "supplier": "HealthPlus", "storage_conditions": "Dry Place"}'),
('PHC-NORTH', 'equipment', '{"name": "Ventilator V-200", "status": "Functional", "last_serviced_date": "2026-05-10", "type": "Life Support"}'),
('PHC-NORTH', 'equipment', '{"name": "ECG Machine", "status": "Maintenance", "last_serviced_date": "2025-11-20", "type": "Diagnostic"}'),
('PHC-NORTH', 'equipment', '{"name": "X-Ray Machine", "status": "Functional", "last_serviced_date": "2026-01-15", "type": "Diagnostic"}'),
('PHC-NORTH', 'transport', '{"name": "Ambulance A1 (ALS)", "status": "Available", "fuel_level": "85%", "driver_contact": "+91 9876543210"}'),
('PHC-NORTH', 'beds', '{"ward_type": "General Ward", "total_beds": 50, "occupied_beds": 45}'),
('CHC-CENTRAL', 'consumables', '{"name": "Paracetamol 500mg", "category": "Medicine", "quantity": 2000, "unit": "tablets", "threshold": 1000, "expiry_date": "2027-01-01", "ai_trend": "Stable", "batch_number": "B-2001", "supplier": "PharmaCorp", "storage_conditions": "Room Temp"}'),
('CHC-CENTRAL', 'equipment', '{"name": "Blood Test Analyzer", "status": "Functional", "last_serviced_date": "2026-03-10", "type": "Diagnostic"}'),
('CHC-CENTRAL', 'equipment', '{"name": "Ultrasound", "status": "Functional", "last_serviced_date": "2026-04-12", "type": "Diagnostic"}'),
('CHC-CENTRAL', 'beds', '{"ward_type": "ICU", "total_beds": 30, "occupied_beds": 28}');

INSERT INTO daily_logs (center_id, timestamp, type, item_name, qty_or_notes) VALUES
('PHC-NORTH', NOW() - INTERVAL '1 day', 'consumption', 'Paracetamol 500mg', '50'),
('PHC-NORTH', NOW() - INTERVAL '12 hours', 'defect', 'ECG Machine', 'Screen flickers when powered on.'),
('PHC-EAST', NOW() - INTERVAL '1 day', 'disease', 'Dengue Cases', '45'),
('PHC-NORTH', NOW() - INTERVAL '14 hours', 'disease', 'Malaria Cases', '5'),
('CHC-CENTRAL', NOW() - INTERVAL '6 hours', 'disease', 'Viral Fever Cases', '120');

INSERT INTO attendance (center_id, staff_name, role, status, duty_hours, leaves, overtime, department, patients_treated) VALUES
('PHC-NORTH', 'Dr. Sharma', 'Doctor', 'Present', 8, 0, 2, 'General', 45),
('PHC-NORTH', 'Nurse Verma', 'Nurse', 'Absent', 0, 1, 0, 'Pediatrics', 0);

INSERT INTO sanctioned_strength (data) VALUES
('{
    "PHC-NORTH": { "Doctor": 5, "Nurse": 10, "Cleaner": 2 },
    "CHC-CENTRAL": { "Doctor": 15, "Nurse": 30, "Compounder": 5 }
}'::jsonb);

INSERT INTO footfall_logs (center_id, patient_count, event_name, expected_attendance, disease_type) VALUES
('CHC-CENTRAL', 300, 'Weekly Market', 5000, 'General');

INSERT INTO command_center_alerts (type, severity, description, source_facility, broadcasted, broadcast_target, timestamp) VALUES
('Disease Cluster', 'High', 'Malaria outbreak in Indira Nagar', 'PHC-EAST', false, null, NOW() - INTERVAL '1 hour'),
('Critical Shortage', 'Elevated', 'Paracetamol stock critical', 'PHC-NORTH', true, 'Health Department', NOW() - INTERVAL '1 day');

INSERT INTO messages (sender_role, sender_name, content, timestamp) VALUES
('admin', 'admin', 'Welcome to the Direct Channel.', NOW() - INTERVAL '1 day');
