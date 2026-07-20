const fs = require('fs');

let content = fs.readFileSync('server/index.js', 'utf8');

const imports = `
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
`;

content = content.replace("import { query } from './db/pool.js';", "import { query } from './db/pool.js';" + imports);

const routes = `
// --- PUBLIC CITIZEN ROUTES ---

const CITIZEN_JWT_SECRET = process.env.CITIZEN_JWT_SECRET || 'fallback_citizen_secret';

// Setup Mock Nodemailer for Hackathon (logs to console)
const transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'windows',
    logger: true
});

app.post('/api/public/signup', async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        // Validate phone (10 digits or +91 format)
        const phoneRegex = /^(\\+91)?[6-9]\\d{9}$/;
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
        
        // Call Gemini
        const vertexAI = new VertexAI({ project: process.env.GOOGLE_CLOUD_PROJECT, location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1' });
        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
        
        const systemPrompt = "You are ArogyaNet AI, a public healthcare assistant for India. Help citizens find information like blood banks, PHCs, or general health guidelines. Keep it concise and helpful.";
        
        const chatResp = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: systemPrompt + "\\n\\nUser: " + message }] }]
        });
        
        const reply = chatResp.response.candidates[0].content.parts[0].text;
        
        // Increment count
        await query('UPDATE citizen_users SET chatbot_usage_count = chatbot_usage_count + 1 WHERE id = $1', [req.citizenId]);
        
        res.json({ success: true, reply });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'AI Service failed' });
    }
});

app.post('/api/public/sos', verifyCitizen, async (req, res) => {
    const { description, location } = req.body;
    try {
        await query(
            'INSERT INTO citizen_sos_reports (user_id, description, location) VALUES ($1, $2, $3)',
            [req.citizenId, description, location]
        );
        res.json({ success: true, message: 'Thank you for reporting. The credibility of this message will be evaluated and appropriate authorities will be informed.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to submit SOS' });
    }
});

app.post('/api/public/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    try {
        const info = await transporter.sendMail({
            from: '"ArogyaNet Contact" <noreply@arogyanet.ai>',
            to: "jayanthchess1705@gmail.com",
            subject: \`New Contact Submission: \${subject}\`,
            text: \`Name: \${name}\\nEmail: \${email}\\nPhone: \${phone}\\nMessage:\\n\${message}\`
        });
        
        console.log("Mock Email sent: %s", info.messageId);
        res.json({ success: true, message: 'Message sent successfully.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

`;

content = content.replace("app.listen(PORT, () => {", routes + "\napp.listen(PORT, () => {");

fs.writeFileSync('server/index.js', content);
console.log('server/index.js updated');
