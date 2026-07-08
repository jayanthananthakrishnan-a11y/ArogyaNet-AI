import express from 'express';
import cors from 'cors';
import { VertexAI } from '@google-cloud/vertexai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db/pool.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- AUTH & REGISTRY ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await query(`SELECT * FROM users WHERE username = $1`, [username]);
        if (result.rows.length > 0 && result.rows[0].password === password) {
            res.json({ success: true, token: 'mock-token', user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, error: 'Invalid username or password' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/facilities/register', async (req, res) => {
    const { id, name, type, location, total_beds, ambulance_strength } = req.body;
    try {
        const result = await query(`INSERT INTO facilities (id, name, type, location, total_beds, critical_alerts, footfall_avg) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
            [id, name, type, location, total_beds, 0, 0]);
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
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
    const result = await query(`SELECT * FROM logistics_summary WHERE center_id = $1`, [center_id]);
    res.json(result.rows[0]);
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
            [center_id, category, id, JSON.stringify(itemData)]
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
    const result = await query(`SELECT dashboard_overview()`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch overview' });
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
        const result = await generativeModel.generateContent(request);
        let text = '';
        if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0]) {
           text = result.response.candidates[0].content.parts[0].text;
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
        const result = await generativeModel.generateContent(request);
        let text = '';
        if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0]) {
           text = result.response.candidates[0].content.parts[0].text;
        }
        
        const cleanText = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        const data = JSON.parse(cleanText);
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
        const result = await generativeModel.generateContent(request);
        res.json({ trend_summary: result.response.candidates[0].content.parts[0].text?.trim() });
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
        const result = await generativeModel.generateContent(request);
        
        const text = result.response.candidates[0].content.parts[0].text || '';
        const recs = text.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*')).map(line => line.replace(/^[-*]\s*/, '').trim());
        
        res.json({ recommendations: recs.length > 0 ? recs : [text] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Governance recommendations error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend proxy server listening on port ${PORT}`);
});
