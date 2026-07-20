import { query } from './server/db/pool.js';

async function migrate() {
    try {
        console.log("Creating citizen_users table...");
        await query(`
            CREATE TABLE IF NOT EXISTS citizen_users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone_number VARCHAR(15) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                premium_status BOOLEAN DEFAULT FALSE,
                chatbot_usage_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("citizen_users created.");

        console.log("Creating citizen_sos_reports table...");
        await query(`
            CREATE TABLE IF NOT EXISTS citizen_sos_reports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES citizen_users(id),
                description TEXT NOT NULL,
                location VARCHAR(255),
                status VARCHAR(50) DEFAULT 'PENDING',
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("citizen_sos_reports created.");

        console.log("Migration complete.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

migrate();
