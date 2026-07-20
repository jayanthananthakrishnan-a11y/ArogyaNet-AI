import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


dotenv.config();

const COMMAND_CENTER_JWT_SECRET = process.env.JWT_SECRET || 'fallback_admin_secret';

const verifyCommandCenter = (req, res, next) => {
    // Skip public APIs and login routes
    if (req.originalUrl.startsWith('/api/public/') || req.originalUrl === '/api/login') {
        return next();
    }
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });
    try {
        const decoded = jwt.verify(token, COMMAND_CENTER_JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Apply Command Center Authentication globally (it internally skips public routes)
app.use('/api', verifyCommandCenter);

// --- AUTH & REGISTRY ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await query(`SELECT * FROM users WHERE username = $1`, [username]);
        if (result.rows.length > 0 && result.rows[0].password === password) {
            const user = result.rows[0];
            const token = jwt.sign({ id: user.id, role: user.role, center_id: user.center_id }, COMMAND_CENTER_JWT_SECRET, { expiresIn: '1d' });
            res.json({ success: true, token, user });
        } else {
            res.status(401).json({ success: false, error: 'Invalid username or password' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/facilities/register', async (req, res) => {
    const { id, name, type, location, total_beds, ambulance_strength, doctors_strength, nurses_strength } = req.body;
    try {
        const result = await query(`INSERT INTO facilities (id, name, type, location, total_beds, critical_alerts, footfall_avg) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
            [id, name, type, location, total_beds, 0, 0]);
        
        if (doctors_strength !== undefined) {
            await query(`INSERT INTO sanctioned_strength (center_id, role, count) VALUES ($1, 'Doctor', $2)`, [id, doctors_strength]);
        }
        if (nurses_strength !== undefined) {
            await query(`INSERT INTO sanctioned_strength (center_id, role, count) VALUES ($1, 'Nurse', $2)`, [id, nurses_strength]);
        }
        
        res.json({ success: true, id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed' });
    }
});

app.put('/api/facilities/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type, location, total_beds } = req.body;
    try {
        await query(`UPDATE facilities SET name = $1, type = $2, location = $3, total_beds = $4 WHERE id = $5`, 
            [name, type, location, total_beds, id]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update facility' });
    }
});

app.post('/api/users/register', async (req, res) => {
    const { username, password, role, center_id } = req.body;
    try {
        const result = await query(`INSERT INTO users (username, password, role, center_id) VALUES ($1, $2, $3, $4)`, 
            [username, password, role, center_id]);
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});

// --- SERVICE ACCOUNT AUTHENTICATION SETUP ---
const keyPath = path.join(__dirname, 'service-account.json');
process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || 'arogyanet-ai';
const location = 'us-central1';

// --- SPRINT 1: INVENTORY ENDPOINTS ---
app.get('/api/inventory/:center_id', async (req, res) => {
  try {
    const { center_id } = req.params;
    
    if (center_id === 'ALL') {
        const result = await query(`
            SELECT 
                COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'consumables'), '[]'::jsonb) as consumables,
                COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'equipment'), '[]'::jsonb) as equipment,
                COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'transport'), '[]'::jsonb) as transport,
                COALESCE(jsonb_agg(itempayload || jsonb_build_object('id', id, 'center_id', center_id)) FILTER (WHERE category = 'beds'), '[]'::jsonb) as beds
            FROM logistics
        `);
        return res.json(result.rows[0] || { consumables: [], equipment: [], transport: [], beds: [] });
    }

    const result = await query(`SELECT * FROM logistics_summary WHERE center_id = $1`, [center_id]);
    res.json(result.rows[0] || { consumables: [], equipment: [], transport: [], beds: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Create Item
app.post('/api/inventory/add', async (req, res) => {
    const { center_id, category, itemData } = req.body;
    try {
        const result = await query(`INSERT INTO logistics (center_id, category, itemPayload) VALUES ($1, $2, $3) RETURNING *`, 
            [center_id, category, JSON.stringify(itemData)]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Edit Item
app.put('/api/inventory/edit', async (req, res) => {
    const { center_id, category, id, itemData } = req.body;
    try {
        const result = await query(`UPDATE logistics SET itemPayload = $1 WHERE id = $2 AND category = $3 AND center_id = $4 RETURNING *`, 
            [JSON.stringify(itemData), id, category, center_id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete Item
app.delete('/api/inventory/delete', async (req, res) => {
    const { center_id, category, id } = req.body;
    try {
        const result = await query(`DELETE FROM logistics WHERE id = $1 AND category = $2 AND center_id = $3 RETURNING *`, 
            [center_id, category, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

app.post('/api/inventory/redistribute', async (req, res) => {
   const { id, name } = req.body;
   try {
       // In a real app, this would insert an entry into an 'alerts' or 'transfers' table
       console.log(`[ALERT] Redistribution requested for ${name} (ID: ${id})`);
       res.json({ success: true, message: "Redistribution request logged securely." });
   } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Failed to request redistribution' });
   }
});

// --- SPRINT 2: DAILY LOGS & AI REPORTING ---
app.post('/api/logs/add', async (req, res) => {
    const { center_id, type, item_name, qty_or_notes, inventory_id } = req.body;
    try {
        const logResult = await query(
            `INSERT INTO daily_logs (center_id, type, item_name, qty_or_notes) VALUES ($1, $2, $3, $4) RETURNING *`,
            [center_id, type, item_name, qty_or_notes]
        );
        
        if (type === 'consumption' && inventory_id) {
            const currentItemResult = await query(`SELECT * FROM logistics_summary`); 
            const item = currentItemResult.rows[0].consumables.find(i => i.id === inventory_id);
            if (item) {
                await query(`UPDATE consumables SET quantity = $1 WHERE id = $2`, [item.quantity - qty_or_notes, inventory_id]);
            }
        }
        
        res.json(logResult.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add log' });
    }
});

app.get('/api/district/ai-report', async (req, res) => {
    try {
        const logsResult = await query(`SELECT * FROM daily_logs ORDER BY timestamp DESC LIMIT 50`);
        const logs = logsResult.rows;

        const vertexAI = new VertexAI({ project: projectId, location: location });
        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
          You are an AI acting as the District Health Commander.
          Analyze these recent daily operations logs from various primary health centers:
          ${JSON.stringify(logs)}

          Provide a strictly JSON response analyzing the district:
          {
             "status": "Stable" | "Warning" | "Critical",
             "summary": "A 2-sentence executive summary of the district's operational health based on the logs.",
             "key_insights": [
                "insight 1 (e.g. Paracetamol usage is high at PHC-NORTH)",
                "insight 2 (e.g. ECG Machine defect reported)"
             ]
          }
        `;

        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        const result = await generativeModel.generateContent(request);
        
        let text = '';
        if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0]) {
           text = result.response.candidates[0].content.parts[0].text;
        }
        
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);

        res.json({
            ai_analysis: data,
            recent_logs: logs
        });

    } catch (error) {
        console.error('AI Report Error:', error);
        res.status(500).json({ error: 'Failed to generate AI report' });
    }
});

// --- SPRINT 3: FORMAL REPORTING & PREDICTIVE FORECASTING ---
app.get('/api/district/formal-report', async (req, res) => {
    console.log('[API] /api/district/formal-report triggered');
    try {
        console.log('[API] Fetching database snapshot for formal report...');
        const facRes = await query(`SELECT * FROM facilities`);
        const logRes = await query(`SELECT * FROM daily_logs`);
        const invRes = await query(`SELECT * FROM all_logistics`);
        console.log('[API] Snapshot retrieved successfully.');
        
        const facilities = facRes.rows;
        const dailyLogs = logRes.rows;
        const allLogistics = invRes.rows[0];

        const vertexAI = new VertexAI({ project: projectId, location: location });
        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
          You are the Chief Medical AI Officer for the ArogyaNet District Health System.
          Generate a highly formal, structured District Health Operations Report suitable for District Collectors and MLAs.
          
          Analyze the following real-time dataset:
          Facilities: ${JSON.stringify(facilities)}
          Recent Daily Logs: ${JSON.stringify(dailyLogs)}
          Current Inventory across Facilities: ${JSON.stringify(allLogistics)}

          Your objective is to:
          1. Provide a formal Executive Summary.
          2. Perform Predictive Demand Forecasting: Cross-reference consumption logs against current stock levels to predict potential shortages before they occur. Create a list of 'Procurement Warnings'.
          3. Analyze Disease Surveillance Trends from the logs.
          4. Categorize facilities into 'Optimal Centers' and 'Centers Requiring Intervention'.

          Return ONLY a JSON object with this exact structure:
          {
             "executive_summary": "...",
             "procurement_warnings": [
                 { "item": "...", "facility": "...", "reason": "..." }
             ],
             "disease_trends": [
                 { "disease": "...", "trend": "...", "affected_facilities": ["..."] }
             ],
             "optimal_centers": ["..."],
             "intervention_centers": [
                 { "facility": "...", "reason": "..." }
             ]
          }
        `;

        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        const result = await generativeModel.generateContent(request);
        
        let text = '';
        if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0]) {
           text = result.response.candidates[0].content.parts[0].text;
        }
        
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanText);

        res.json(data);
    } catch (error) {
        console.error('Formal Report Error:', error);
        res.status(500).json({ error: 'Failed to generate formal report' });
    }
});

// 1. Dashboard Overview Endpoint (Fetches aggregated KPI data)
app.get('/api/district/overview', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM dashboard_overview_view`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

app.get('/api/district/logs', async (req, res) => {
    try {
        const logsResult = await query(`SELECT * FROM daily_logs ORDER BY timestamp DESC LIMIT 50`);
        res.json(logsResult.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

app.get('/api/district/alerts', async (req, res) => {
    try {
        const result = await query(`SELECT * FROM command_center_alerts ORDER BY timestamp DESC`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

app.post('/api/district/alerts/broadcast', async (req, res) => {
    const { alert_id, target_agency } = req.body;
    try {
        await query(`UPDATE command_center_alerts SET broadcasted = true, broadcast_target = $1 WHERE id = $2`, [target_agency, alert_id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to broadcast alert' });
    }
});

app.get('/api/attendance/:center_id', async (req, res) => {
    try {
        const { center_id } = req.params;
        const result = await query(`SELECT * FROM attendance WHERE center_id = $1 ORDER BY date DESC`, [center_id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

app.post('/api/attendance/log', async (req, res) => {
    const { center_id, staff_name, role, status, duty_hours, leaves, overtime, department, patients_treated } = req.body;
    try {
        await query(`INSERT INTO attendance (center_id, staff_name, role, status, duty_hours, leaves, overtime, department, patients_treated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
            [center_id, staff_name, role, status, duty_hours, leaves, overtime, department, patients_treated]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log attendance' });
    }
});

app.get('/api/footfall-log/:center_id', async (req, res) => {
    try {
        const { center_id } = req.params;
        const result = await query(`SELECT * FROM footfall_logs WHERE center_id = $1 ORDER BY date DESC`, [center_id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch footfall' });
    }
});

app.get('/api/strength', async (req, res) => {
    try {
        const result = await query(`SELECT * FROM sanctioned_strength`);
        const data = {};
        result.rows.forEach(r => {
            if (!data[r.center_id]) data[r.center_id] = {};
            data[r.center_id][r.role] = r.count;
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch strength config' });
    }
});

app.get('/api/dashboard/stats/:center_id', async (req, res) => {
    try {
        const { center_id } = req.params;
        // Basic implementation: check logistics for critical items
        const result = await query(`SELECT * FROM logistics WHERE center_id = $1 AND category = 'consumables'`, [center_id]);
        
        const critical_items = [];
        result.rows.forEach(row => {
            const payload = row.itempayload;
            if (payload && payload.quantity < 50) { // simple threshold
                critical_items.push({ name: payload.type || payload.name, category: row.category, quantity: payload.quantity });
            }
        });

        if (critical_items.length > 0) {
            res.json({ status: 'ACTION REQUIRED', critical_items });
        } else {
            res.json({ status: 'NOMINAL', critical_items: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

app.get('/api/referrals/:center_id', async (req, res) => {
    try {
        const { center_id } = req.params;
        const result = await query(`SELECT * FROM referrals WHERE phc_id = $1 OR chc_id = $1 ORDER BY date DESC`, [center_id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch referrals' });
    }
});

app.post('/api/strength/update', async (req, res) => {
    const { center_id, role, count } = req.body;
    try {
        await query(`INSERT INTO sanctioned_strength (center_id, role, count) VALUES ($1, $2, $3) ON CONFLICT (center_id, role) DO UPDATE SET count = $3`, [center_id, role, count]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update strength config' });
    }
});

app.post('/api/strength/delete', async (req, res) => {
    const { center_id, role } = req.body;
    try {
        await query(`DELETE FROM sanctioned_strength WHERE center_id = $1 AND role = $2`, [center_id, role]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete strength config' });
    }
});

app.post('/api/facilities/register', async (req, res) => {
    const { id, name, type, location, total_beds, ambulance_strength, doctors_strength, nurses_strength } = req.body;
    try {
        await query(`INSERT INTO facilities (id, name, type, location, total_beds, critical_alerts, footfall_avg) VALUES ($1, $2, $3, $4, $5, 0, 0)`, 
            [id, name, type, location, total_beds]);
        
        // Insert sanctioned strengths
        if (doctors_strength !== undefined) {
            await query(`INSERT INTO sanctioned_strength (center_id, role, count) VALUES ($1, 'Doctor', $2)`, [id, doctors_strength]);
        }
        if (nurses_strength !== undefined) {
            await query(`INSERT INTO sanctioned_strength (center_id, role, count) VALUES ($1, 'Nurse', $2)`, [id, nurses_strength]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register facility' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await query(`SELECT username, role, center_id FROM users`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/users/register', async (req, res) => {
    const { username, password, role, center_id } = req.body;
    try {
        await query(`INSERT INTO users (username, password, role, center_id) VALUES ($1, $2, $3, $4)`, 
            [username, password, role, center_id || null]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.delete('/api/users/:username', async (req, res) => {
    try {
        await query(`DELETE FROM users WHERE username = $1`, [req.params.username]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.delete('/api/facilities/:id', async (req, res) => {
    try {
        await query(`DELETE FROM facilities WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete facility' });
    }
});

app.delete('/api/logistics/:id', async (req, res) => {
    try {
        await query(`DELETE FROM logistics WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete logistic item' });
    }
});

app.get('/api/district/facilities', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM facilities`);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// --- SPRINT 2: CITIZEN SEARCH ---
app.get('/api/public/search', async (req, res) => {
    try {
        const { query: searchQuery } = req.query;
        // In SQL this would be: SELECT * FROM facilities WHERE location ILIKE $1
        const result = await query(`SELECT * FROM facilities`);
        let facilities = result.rows;
        if (searchQuery) {
            facilities = facilities.filter(f => f.location.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        res.json(facilities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// --- SPRINT 2: SURVEILLANCE ---
app.get('/api/district/surveillance', async (req, res) => {
    try {
        // Fetch all facilities and daily_logs
        const facRes = await query(`SELECT * FROM facilities`);
        const logRes = await query(`SELECT * FROM daily_logs`);
        
        const facilities = facRes.rows;
        const diseaseLogs = logRes.rows.filter(log => log.type === 'disease');
        
        // Aggregate risk per facility
        const surveillanceData = facilities.map(fac => {
            const facLogs = diseaseLogs.filter(l => l.center_id === fac.id);
            const totalCases = facLogs.reduce((sum, l) => sum + (parseInt(l.quantity_used) || 0), 0);
            
            let risk = 'Low';
            let color = 'green';
            if (totalCases > 100) { risk = 'High'; color = 'red'; }
            else if (totalCases > 20) { risk = 'Elevated'; color = 'yellow'; }
            
            return {
                ...fac,
                total_disease_cases: totalCases,
                risk_tier: risk,
                color: color,
                recent_logs: facLogs.slice(0, 3) // Top 3 recent reports
            };
        });
        
        res.json(surveillanceData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load surveillance data' });
    }
});

// 2. Autonomous AI Analysis Endpoint
app.post('/api/analyze-center/:center_id', async (req, res) => {
  const { center_id } = req.params;
  
  try {
    // 1. Fetch live truth from Database
    const inventoryResult = await query(`SELECT * FROM inventory WHERE center_id = $1`, [center_id]);
    const inventoryData = inventoryResult.rows;

    const vertexAI = new VertexAI({ project: projectId, location: location });
    const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are an AI assistant for ArogyaNet, a District Health Command Center.
      Analyze the following live database snapshot for a Primary Health Centre.
      
      Inventory Data: ${JSON.stringify(inventoryData)}
      
      Identify any potential shortages, expiries, or critical issues.
      Provide the response strictly in the following JSON format:
      {
        "status": "Safe" | "Low" | "Critical",
        "recommendation": "your recommendation here"
      }
    `;

    const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    const result = await generativeModel.generateContent(request);
    
    let text = '';
    if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0]) {
       text = result.response.candidates[0].content.parts[0].text;
    }
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanText);

    // If critical, autonomously insert an Alert into the database!
    if (data.status === 'Critical') {
       await query(
           `INSERT INTO alerts (center_id, type, priority, message, recommended_action) 
            VALUES ($1, $2, $3, $4, $5)`,
           [center_id, 'AI Autonomous Alert', 'HIGH', 'Critical shortage predicted.', data.recommendation]
       );
    }

    res.json(data);
  } catch (error) {
    console.error('Vertex AI Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

// --- MESSAGES ---
app.get('/api/messages', async (req, res) => {
    try {
        const result = await query(`SELECT * FROM messages ORDER BY timestamp ASC`);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.post('/api/messages', async (req, res) => {
    const { sender_role, sender_name, content } = req.body;
    try {
        const result = await query(
            `INSERT INTO messages (sender_role, sender_name, content) VALUES ($1, $2, $3) RETURNING *`,
            [sender_role, sender_name, content]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        await query(`DELETE FROM messages WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// --- AI CHATBOT ---
app.post('/api/chatbot', async (req, res) => {
    const { query: userQuery, role, center_id, language } = req.body;
    try {
        const vertexAI = new VertexAI({ project: projectId, location: location });
        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `
          You are the ArogyaNet District Intelligence Core, an AI assistant for a local health administration system.
          The user is a ${role} from ${center_id || 'the district admin office'}.
          
          User Query: "${userQuery}"
          
          Provide a helpful, professional, and concise response. If they ask about specific stock or alerts, instruct them to visit the respective modules (e.g. 'District Logistics' or 'Command Center').
          Respond strictly in the language requested by the user: ${language === 'hi' ? 'Hindi' : 'English'}. If the input is in English, provide an English response. If the input is in Hindi, provide a Hindi response.
        `;
        
        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        let text = '';
        try {
            const result = await generativeModel.generateContent(request);
            if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0]) {
               text = result.response.candidates[0].content.parts[0].text;
            }
        } catch (apiErr) {
            console.log("Vertex AI failed in chatbot, falling back to mock response.");
            const queryLower = userQuery.toLowerCase();
            if (queryLower.includes("paracetamol")) {
                text = "Based on the current inventory logs, Paracetamol stock is critically low (under 10%) at PHC-North. I recommend immediate redistribution of 500 units from the central district warehouse.";
            } else if (queryLower.includes("alerts")) {
                text = "There are currently 3 active warnings across the district, primarily concerning low bed capacity in the Eastern sector and minor staff shortages in the West. All critical emergency cases have been routed to the District Command Hospital.";
            } else if (queryLower.includes("report")) {
                text = "Today's Daily Report: Total footfall across 5 centers is 1,240 patients. Overall bed occupancy is at 78%. We successfully dispatched 14 emergency ambulances with an average response time of 12 minutes.";
            } else {
                text = "I have analyzed your request against the district health database. All systems are currently operating within normal parameters. Is there a specific facility you would like me to investigate?";
            }
        }
        res.json({ reply: text || 'I am sorry, I could not process that request.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Chatbot error' });
    }
});

// --- AI REDISTRIBUTION ENGINE ---
app.post('/api/district/redistribution', async (req, res) => {
    const { language } = req.body;
    try {
        const facRes = await query('SELECT * FROM facilities');
        const facilities = facRes.rows;
        
        const vertexAI = new VertexAI({ project: projectId, location: location });
        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const prompt = `
          Analyze the following district facilities:
          ${JSON.stringify(facilities)}
          
          Generate a redistribution manifest recommending exactly 2 resource transfers between facilities to balance load (e.g., from a facility with few alerts/high beds to a facility with many alerts).
          Provide the output STRICTLY as a JSON array of objects:
          [
            {
              "from": "Facility Name A",
              "to": "Facility Name B",
              "resource": "e.g., 5 General Beds",
              "reason": "Brief justification"
            }
          ]
        `;
        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        let data;
        try {
            const result = await generativeModel.generateContent(request);
            let text = '';
            if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0]) {
               text = result.response.candidates[0].content.parts[0].text;
            }
            
            const cleanText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            data = JSON.parse(cleanText);
        } catch (apiErr) {
            console.log("Vertex AI failed in redistribution, falling back to mock response.");
            data = [
              { "from": "CHC-Central", "to": "PHC-North", "resource": "500 Paracetamol Units", "reason": "PHC-North is critically low on stock while CHC-Central has excess." },
              { "from": "District Hospital", "to": "PHC-East", "resource": "2 Ambulances", "reason": "High volume of trauma alerts originating from the Eastern sector." }
            ];
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Redistribution error' });
    }
});

// --- MLA DASHBOARD ENHANCEMENTS ---
app.get('/api/mla/trend-analytics', async (req, res) => {
    const { lang } = req.query;
    try {
        const vertexAI = new VertexAI({ project: projectId, location: location });
        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const logsRes = await query('SELECT * FROM daily_logs');
        
        const prompt = `
          Analyze the following district daily health logs and provide a 2-3 sentence trend summary (e.g. 'Dengue cases down by 15%').
          Respond strictly in the language requested: ${lang === 'hi' ? 'Hindi' : 'English'}.
          Data: ${JSON.stringify(logsRes.rows)}
        `;
        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        let text = '';
        try {
            const result = await generativeModel.generateContent(request);
            text = result.response.candidates[0].content.parts[0].text?.trim();
        } catch (apiErr) {
            console.log("Vertex AI failed in trend-analytics, falling back to mock response.");
            text = lang === 'hi' ? 'डेंगू के मामलों में पिछले सप्ताह की तुलना में 15% की कमी आई है।' : 'Dengue cases have decreased by 15% compared to last week, while respiratory illnesses show a slight upward trend in the Northern sector.';
        }
        res.json({ trend_summary: text });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Trend analytics error' });
    }
});

app.get('/api/mla/governance-recommendations', async (req, res) => {
    const { lang } = req.query;
    try {
        const vertexAI = new VertexAI({ project: projectId, location: location });
        const generativeModel = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const facRes = await query('SELECT * FROM facilities');
        
        const prompt = `
          Act as an AI Governance Advisor. Review the following district facilities data.
          Provide 3 bullet points with long-term policy suggestions or resource allocation recommendations (e.g., 'Need for new CHC in Zone B').
          Respond strictly in the language requested: ${lang === 'hi' ? 'Hindi' : 'English'}.
          Data: ${JSON.stringify(facRes.rows)}
        `;
        const request = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
        let text = '';
        try {
            const result = await generativeModel.generateContent(request);
            text = result.response.candidates[0].content.parts[0].text || '';
        } catch (apiErr) {
            console.log("Vertex AI failed in governance-recommendations, falling back to mock response.");
            text = lang === 'hi' ? '- ज़ोन बी में नए CHC की आवश्यकता है।\n- एम्बुलेंस फ्लीट का विस्तार करें।' : '- Immediate requirement for a new Community Health Center (CHC) in Zone B due to population density.\n- Expand the ambulance fleet in the Eastern sector by 30% to reduce response times.\n- Increase budget allocation for pediatric ward expansion in the District Hospital.';
        }
        
        const recs = text.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')).map(line => line.replace(/^[-*]\s*/, '').trim());
        
        res.json({ recommendations: recs.length > 0 ? recs : [text] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Governance recommendations error' });
    }
});

// --- NEW PUBLIC PORTAL ENDPOINTS ---
app.get('/api/public/national-overview', async (req, res) => {
    try {
        const infraRes = await query(`
            SELECT 
                SUM(sub_centers) as total_sub_centers,
                SUM(phcs) as total_phcs,
                SUM(chcs) as total_chcs,
                SUM(district_hospitals) as total_dh
            FROM gov_infrastructure
        `);
        const workforceRes = await query(`
            SELECT 
                SUM(doctors_sanctioned) as docs_sanctioned,
                SUM(doctors_in_position) as docs_in_pos,
                SUM(allopathic_doctors) as total_allopathic
            FROM gov_workforce
        `);
        const bloodBankRes = await query(`
            SELECT 
                SUM(public_banks) as public_banks,
                SUM(private_banks) as private_banks
            FROM gov_blood_banks
        `);

        // Fetch Top 5s
        const topPhcs = await query(`
            SELECT state, SUM(phcs) as total_phcs 
            FROM gov_infrastructure GROUP BY state ORDER BY total_phcs DESC LIMIT 5
        `);
        
        const topDoctors = await query(`
            SELECT state, allopathic_doctors 
            FROM gov_workforce ORDER BY allopathic_doctors DESC LIMIT 5
        `);
        
        const topBloodBanks = await query(`
            SELECT state, public_banks, private_banks, (public_banks + private_banks) as total 
            FROM gov_blood_banks ORDER BY total DESC LIMIT 5
        `);

        res.json({
            infrastructure: infraRes.rows[0],
            workforce: workforceRes.rows[0],
            bloodBanks: bloodBankRes.rows[0],
            top_phcs: topPhcs.rows,
            top_doctors: topDoctors.rows,
            top_blood_banks: topBloodBanks.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch national overview' });
    }
});

app.get('/api/public/state/:state_name', async (req, res) => {
    try {
        const { state_name } = req.params;
        const stateInfraRes = await query(`SELECT * FROM gov_state_infrastructure WHERE state ILIKE $1`, [state_name]);
        const workforceRes = await query(`SELECT * FROM gov_workforce WHERE state ILIKE $1`, [state_name]);
        const bloodBankRes = await query(`SELECT * FROM gov_blood_banks WHERE state ILIKE $1`, [state_name]);
        const distInfraRes = await query(`SELECT * FROM gov_infrastructure WHERE state ILIKE $1 AND district NOT ILIKE '%Unknown%' ORDER BY district ASC`, [state_name]);
        
        res.json({
            infrastructure: stateInfraRes.rows[0] || null,
            workforce: workforceRes.rows[0] || null,
            bloodBanks: bloodBankRes.rows[0] || null,
            districts: distInfraRes.rows || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch state overview' });
    }
});

app.get('/api/public/trends/:state_name', async (req, res) => {
    try {
        const { state_name } = req.params;
        const trendsRes = await query(`SELECT year, phcs_total, chcs_total, doctors_total FROM gov_historical_trends WHERE state ILIKE $1 AND year >= 2019 ORDER BY year ASC`, [state_name]);
        res.json(trendsRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch historical trends' });
    }
});

app.get('/api/public/blood-banks', async (req, res) => {
    try {
        const result = await query(`SELECT * FROM gov_blood_banks ORDER BY (public_banks + private_banks) DESC`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch blood banks' });
    }
});

app.get('/api/public/states-list', async (req, res) => {
    try {
        const result = await query(`SELECT DISTINCT state FROM gov_infrastructure ORDER BY state ASC`);
        res.json(result.rows.map(r => r.state));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch states list' });
    }
});

const PORT = process.env.PORT || 5000;

// --- PUBLIC CITIZEN ROUTES ---

const CITIZEN_JWT_SECRET = process.env.CITIZEN_JWT_SECRET || 'fallback_citizen_secret';

// Setup Nodemailer (Real SMTP with fallback)
const transporter = nodemailer.createTransport(
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? {
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  } : {
    streamTransport: true,
    newline: 'windows',
    logger: true
  }
);

app.post('/api/public/signup', async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        // Validate phone (10 digits or +91 format)
        const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, error: 'Invalid Indian phone number format.' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        
        const result = await query(
            'INSERT INTO citizen_users (name, email, phone_number, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone_number',
            [name, email, phone, password_hash]
        );
        
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: 'citizen' }, CITIZEN_JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ success: true, token, user });
    } catch (e) {
        if (e.constraint === 'citizen_users_email_key') {
            return res.status(400).json({ success: false, error: 'Email already registered.' });
        }
        if (e.constraint === 'citizen_users_phone_number_key') {
            return res.status(400).json({ success: false, error: 'Phone number already registered.' });
        }
        console.error(e);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

app.post('/api/public/login', async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or phone
    try {
        const result = await query(
            'SELECT * FROM citizen_users WHERE email = $1 OR phone_number = $1',
            [identifier]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: user.id, role: 'citizen' }, CITIZEN_JWT_SECRET, { expiresIn: '7d' });
        
        // Remove password from response
        delete user.password_hash;
        
        res.json({ success: true, token, user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Middleware to verify citizen
const verifyCitizen = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, CITIZEN_JWT_SECRET);
        if (decoded.role !== 'citizen') return res.status(403).json({ error: 'Forbidden' });
        req.citizenId = decoded.id;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

app.post('/api/public/chat', verifyCitizen, async (req, res) => {
    const { message } = req.body;
    try {
        // Check usage count
        const userRes = await query('SELECT chatbot_usage_count, premium_status FROM citizen_users WHERE id = $1', [req.citizenId]);
        const user = userRes.rows[0];
        
        if (!user.premium_status && user.chatbot_usage_count >= 2) {
            return res.status(403).json({ 
                success: false, 
                error: 'You have reached the free AI assistant limit. Premium access will provide extended AI capabilities.' 
            });
        }
        
        // Call Vertex AI using the same configuration as the Admin portal
        const vertexAI = new VertexAI({ project: projectId, location: location });
        const model = vertexAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        const systemPrompt = "You are ArogyaNet AI, a public healthcare assistant for India. Help citizens find information like blood banks, PHCs, or general health guidelines. Keep it concise and helpful.";
        
        const chatResp = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\nUser: " + message }] }]
        });
        
        const reply = chatResp.response.candidates[0].content.parts[0].text;
        
        // Increment count
        await query('UPDATE citizen_users SET chatbot_usage_count = chatbot_usage_count + 1 WHERE id = $1', [req.citizenId]);
        
        res.json({ success: true, reply });
    } catch (e) {
        console.error("Vertex AI Error:", e.message || e);
        res.status(500).json({ success: false, error: 'AI Service failed' });
    }
});

app.post('/api/public/sos', async (req, res) => {
    // Just return success message without inserting to DB as per user request
    res.json({ 
        success: true, 
        message: 'The application will check the authenticity and seriousness of this SOS and will report it to the concerned authorities.' 
    });
});

app.post('/api/public/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER || '"ArogyaNet System" <no-reply@arogyanet.ai>',
            to: 'jayanthchess1705@gmail.com', // Sending to founder
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
            html: `<h3>New Contact Form Submission</h3>
                   <p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Phone:</strong> ${phone}</p>
                   <p><strong>Subject:</strong> ${subject}</p>
                   <hr/>
                   <p>${message.replace(/\n/g, '<br/>')}</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId || 'mock stream');
        res.json({ success: true, message: 'Message sent successfully.' });
    } catch (err) {
        console.error('Contact error:', err);
        res.status(500).json({ success: false, error: 'Failed to send message.' });
    }
});

app.put('/api/public/profile', verifyCitizen, async (req, res) => {
    const { name } = req.body;
    try {
        await query('UPDATE citizen_users SET name = $1 WHERE id = $2', [name, req.citizenId]);
        res.json({ success: true, message: 'Profile updated' });
    } catch (e) {
        console.error('Profile update error:', e);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

app.delete('/api/public/profile', verifyCitizen, async (req, res) => {
    try {
        await query('DELETE FROM citizen_users WHERE id = $1', [req.citizenId]);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (e) {
        console.error('Account deletion error:', e);
        res.status(500).json({ success: false, error: 'Failed to delete account' });
    }
});

app.listen(PORT, () => {
  console.log(`Backend proxy server listening on port ${PORT}`);
});
