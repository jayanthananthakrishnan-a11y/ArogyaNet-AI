import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from server/.env
dotenv.config({ path: path.join(__dirname, '../../server/.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgresql@localhost:5432/postgres"
});

const rawDir = path.join(__dirname, '../raw');

const normalizeStateName = (name) => {
    if (!name) return '';
    return name
        .trim()
        .toLowerCase()
        // Replace multiple spaces with a single space
        .replace(/\s+/g, ' ')
        // Title Case
        .split(' ')
        .map(word => {
            // Special cases like "and"
            if (word === 'and') return 'and';
            if (word === 'of') return 'of';
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ')
        // Special manual mapping for known discrepancies
        .replace('Andaman and Nicobar Islands', 'Andaman and Nicobar Islands')
        .replace('Dadra and Nagar Haveli and Daman and Diu', 'The Dadra and Nagar Haveli and Daman and Diu')
        // Title Case capitalization for first word
        .replace(/^./, str => str.toUpperCase());
};

async function importData() {
  console.log("Starting data import...");

  // 1. Create Tables
  await pool.query(`
    DROP TABLE IF EXISTS gov_infrastructure CASCADE;
    DROP TABLE IF EXISTS gov_state_infrastructure CASCADE;
    DROP TABLE IF EXISTS gov_workforce CASCADE;
    DROP TABLE IF EXISTS gov_blood_banks CASCADE;
    DROP TABLE IF EXISTS gov_historical_trends CASCADE;

    CREATE TABLE gov_infrastructure (
        id SERIAL PRIMARY KEY,
        state VARCHAR(255),
        district VARCHAR(255),
        sub_centers INTEGER DEFAULT 0,
        phcs INTEGER DEFAULT 0,
        chcs INTEGER DEFAULT 0,
        sub_divisional_hospitals INTEGER DEFAULT 0,
        district_hospitals INTEGER DEFAULT 0
    );

    CREATE TABLE gov_state_infrastructure (
        id SERIAL PRIMARY KEY,
        state VARCHAR(255),
        sub_centers INTEGER DEFAULT 0,
        phcs INTEGER DEFAULT 0,
        chcs INTEGER DEFAULT 0,
        hwcs INTEGER DEFAULT 0
    );

    CREATE TABLE gov_workforce (
        id SERIAL PRIMARY KEY,
        state VARCHAR(255),
        doctors_sanctioned INTEGER DEFAULT 0,
        doctors_in_position INTEGER DEFAULT 0,
        doctors_shortfall INTEGER DEFAULT 0,
        anm_sanctioned INTEGER DEFAULT 0,
        anm_in_position INTEGER DEFAULT 0,
        anm_shortfall INTEGER DEFAULT 0,
        allopathic_doctors INTEGER DEFAULT 0,
        dental_surgeons INTEGER DEFAULT 0
    );

    CREATE TABLE gov_blood_banks (
        id SERIAL PRIMARY KEY,
        state VARCHAR(255),
        public_banks INTEGER DEFAULT 0,
        private_banks INTEGER DEFAULT 0
    );

    CREATE TABLE gov_historical_trends (
        id SERIAL PRIMARY KEY,
        state VARCHAR(255),
        year INTEGER,
        phcs_total INTEGER DEFAULT 0,
        chcs_total INTEGER DEFAULT 0,
        doctors_total INTEGER DEFAULT 0,
        UNIQUE (state, year)
    );
  `);
  console.log("Tables created successfully.");

  // Helper to read CSV
  const readCSV = (filename) => {
    const filePath = path.join(rawDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return parse(content, { columns: true, skip_empty_lines: true });
  };

  const parseIntSafe = (val) => {
    if (!val || val === '' || val.trim() === '') return 0;
    const parsed = parseInt(val.replace(/,/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Maps for historical trends
  const historicalTrends = new Map(); // key: state-year

  const addHistoricalTrend = (state, year, field, value) => {
    if (year <= 0 || !state) return;
    const key = `${state}-${year}`;
    if (!historicalTrends.has(key)) {
        historicalTrends.set(key, { state, year, phcs_total: 0, chcs_total: 0, doctors_total: 0 });
    }
    historicalTrends.get(key)[field] += value;
  };

  // 2. Import Districtwise Infrastructure
  const distInfraFile = 'Rural Health Statistics Districtwise Health Care Infrastructure.csv';
  const distInfra = readCSV(distInfraFile);
  const latestDistInfra = new Map();
  for (const row of distInfra) {
    if (row.Country !== 'India') continue;
    const district = row.District;
    if (!district || district.toLowerCase().includes('unknown')) continue;

    const state = normalizeStateName(row.State);
    const yearMatch = row.Year ? row.Year.match(/\d{4}/) : null;
    const year = yearMatch ? parseInt(yearMatch[0]) : 0;
    
    const key = `${state}-${district}`;

    if (!latestDistInfra.has(key) || latestDistInfra.get(key).year < year) {
        latestDistInfra.set(key, {
            year,
            state,
            district,
            subCenters: parseIntSafe(row['Functional Sub Centres (UOM:Number), Scaling Factor:1']),
            phcs: parseIntSafe(row['Functional Primary Health Centres (Phcs) (UOM:Number), Scaling Factor:1']),
            chcs: parseIntSafe(row['Functional Community Health Centres (Chcs) (UOM:Number), Scaling Factor:1']),
            sdh: parseIntSafe(row['Functional Sub Divisional Hospitals (Sdhs) (UOM:Number), Scaling Factor:1']),
            dh: parseIntSafe(row['Functional District Hospitals (Dhs) (UOM:Number), Scaling Factor:1'])
        });
    }
  }

  for (const data of latestDistInfra.values()) {
    await pool.query(`
      INSERT INTO gov_infrastructure (state, district, sub_centers, phcs, chcs, sub_divisional_hospitals, district_hospitals)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [data.state, data.district, data.subCenters, data.phcs, data.chcs, data.sdh, data.dh]);
  }
  console.log(`Imported ${latestDistInfra.size} deduplicated rows from district infrastructure.`);

  // 3. Import Statewise Infrastructure (NEW)
  const stateInfraFile = 'StateUT Wise Number of Sub-Centres, Primary Health Centres (PHC), Community Health Centres (CHC) & Health and Wellness Centres (HWC) Functioning in Rural & Urban Areas.csv';
  const stateInfra = readCSV(stateInfraFile);
  const latestStateInfra = new Map();
  for (const row of stateInfra) {
    if (row.Country !== 'India') continue;
    const state = normalizeStateName(row.State);
    const yearMatch = row.Year ? row.Year.match(/\d{4}/) : null;
    const year = yearMatch ? parseInt(yearMatch[0]) : 0;

    const scs = parseIntSafe(row['Number Of Sub Centers In Rural Areas (UOM:Number), Scaling Factor:1']) + 
                parseIntSafe(row['Number Of Sub Centers In Urban Areas (UOM:Number), Scaling Factor:1']);
    const phcs = parseIntSafe(row['Primary Helath Centres (Phc) In Rural Areas (UOM:Number), Scaling Factor:1']) + 
                 parseIntSafe(row['Primary Helath Centres (Phc) In Urban Areas (UOM:Number), Scaling Factor:1']);
    const hwcs = parseIntSafe(row['Number Of Sub Centres Under Health And Wellness Centres (Hwc) (UOM:Number), Scaling Factor:1']) +
                 parseIntSafe(row['Rural Primary Health Centres Under Health And Wellness Centres (Hwc) (UOM:Number), Scaling Factor:1']) +
                 parseIntSafe(row['Urban Primary Health Centres Under Health And Wellness Centres (Hwc) (UOM:Number), Scaling Factor:1']);
    const chcs = parseIntSafe(row['Community Health Centres (Chc) In Rural Areas (UOM:Number), Scaling Factor:1']) + 
                 parseIntSafe(row['Community Health Centres (Chc) In Urban Areas (UOM:Number), Scaling Factor:1']);
    
    // Add to historical trends
    addHistoricalTrend(state, year, 'phcs_total', phcs);
    addHistoricalTrend(state, year, 'chcs_total', chcs);

    if (!latestStateInfra.has(state) || latestStateInfra.get(state).year < year) {
        latestStateInfra.set(state, {
            year,
            state,
            scs,
            phcs,
            hwcs,
            chcs
        });
    }
  }

  for (const data of latestStateInfra.values()) {
    await pool.query(`
      INSERT INTO gov_state_infrastructure (state, sub_centers, phcs, chcs, hwcs)
      VALUES ($1, $2, $3, $4, $5)
    `, [data.state, data.scs, data.phcs, data.chcs, data.hwcs]);
  }
  console.log(`Imported ${latestStateInfra.size} deduplicated rows from state infrastructure.`);

  // 4. Import Statewise Workforce
  const stateWorkforceFile = 'Rural Health Statistics Statewise Statistics (CY).csv';
  const stateWorkforce = readCSV(stateWorkforceFile);
  const latestWorkforce = new Map();
  for (const row of stateWorkforce) {
    if (row.Country !== 'India') continue;
    const state = normalizeStateName(row.State);
    const yearMatch = row.Year ? row.Year.match(/\d{4}/) : null;
    const year = yearMatch ? parseInt(yearMatch[0]) : 0;
    
    if (!latestWorkforce.has(state) || latestWorkforce.get(state).year < year) {
        latestWorkforce.set(state, {
            year,
            docsSanctioned: parseIntSafe(row['Doctors Sanctioned At Phcs In Rural Areas (UOM:Number), Scaling Factor:1']),
            docsInPos: parseIntSafe(row['Doctors In Position At Phcs In Rural Areas (UOM:Number), Scaling Factor:1']),
            docsShortfall: parseIntSafe(row['Doctors Shortfall At Phcs In Rural Areas (UOM:Number), Scaling Factor:1']),
            anmSanctioned: parseIntSafe(row['Anm Sanctioned At Sub Centres And Phcs In Rural Areas (UOM:Number), Scaling Factor:1']),
            anmInPos: parseIntSafe(row['Anm In Position At Sub Centres And Phcs In Rural Areas (UOM:Number), Scaling Factor:1']),
            anmShortfall: parseIntSafe(row['Anm Shortfall At Sub Centres And Phcs In Rural Areas (UOM:Number), Scaling Factor:1'])
        });
    }
  }

  for (const [state, data] of latestWorkforce.entries()) {
    await pool.query(`
      INSERT INTO gov_workforce (state, doctors_sanctioned, doctors_in_position, doctors_shortfall, anm_sanctioned, anm_in_position, anm_shortfall)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [state, data.docsSanctioned, data.docsInPos, data.docsShortfall, data.anmSanctioned, data.anmInPos, data.anmShortfall]);
  }

  // Update Workforce with Government Doctors data
  const govDocsFile = 'Government Allopathic Doctors and Dental Surgeons.csv';
  const govDocs = readCSV(govDocsFile);
  const latestGovDocs = new Map();
  for (const row of govDocs) {
    if (row.Country !== 'India') continue;
    const state = normalizeStateName(row.State);
    const yearMatch = row.Year ? row.Year.match(/\d{4}/) : null;
    const year = yearMatch ? parseInt(yearMatch[0]) : 0;
    
    const allopathic = parseIntSafe(row['Number Of Government Allopathic Doctors (UOM:Number), Scaling Factor:1']);
    
    // Add to historical trends
    addHistoricalTrend(state, year, 'doctors_total', allopathic);

    if (!latestGovDocs.has(state) || latestGovDocs.get(state).year < year) {
        latestGovDocs.set(state, {
            year,
            allopathic,
            dental: parseIntSafe(row['Number Of Government Dental Surgeons (UOM:Number), Scaling Factor:1'])
        });
    }
  }

  for (const [state, data] of latestGovDocs.entries()) {
    const res = await pool.query('SELECT id FROM gov_workforce WHERE state = $1 LIMIT 1', [state]);
    if (res.rows.length > 0) {
        await pool.query(`UPDATE gov_workforce SET allopathic_doctors = $1, dental_surgeons = $2 WHERE state = $3`, [data.allopathic, data.dental, state]);
    } else {
        await pool.query(`INSERT INTO gov_workforce (state, allopathic_doctors, dental_surgeons) VALUES ($1, $2, $3)`, [state, data.allopathic, data.dental]);
    }
  }
  console.log(`Imported workforce data.`);

  // 5. Import Blood Banks
  const bloodBanksFile = 'StateUT Wise Number of Licensed Blood Banks.csv';
  const bloodBanks = readCSV(bloodBanksFile);
  const latestBloodBanks = new Map();
  for (const row of bloodBanks) {
    if (row.Country !== 'India') continue;
    const state = normalizeStateName(row.State);
    const yearMatch = row.Year ? row.Year.match(/\d{4}/) : null;
    const year = yearMatch ? parseInt(yearMatch[0]) : 0;
    
    if (!latestBloodBanks.has(state) || latestBloodBanks.get(state).year < year) {
        let publicBanks = parseIntSafe(row['Number Of Public Blood Bank  (UOM:Number), Scaling Factor:1']);
        if (!publicBanks && publicBanks !== 0) {
           publicBanks = parseIntSafe(row['Number Of Public Blood Bank (UOM:Number), Scaling Factor:1']);
        }
        const privateBanks = parseIntSafe(row['Number Of Private Blood Bank (UOM:Number), Scaling Factor:1']);
        latestBloodBanks.set(state, { year, publicBanks, privateBanks });
    }
  }

  for (const [state, data] of latestBloodBanks.entries()) {
    await pool.query(`
      INSERT INTO gov_blood_banks (state, public_banks, private_banks)
      VALUES ($1, $2, $3)
    `, [state, data.publicBanks, data.privateBanks]);
  }
  console.log(`Imported blood banks data for ${latestBloodBanks.size} states.`);

  // Forward Fill Historical Trends to avoid 0 drops
  const statesSet = new Set([...historicalTrends.values()].map(t => t.state));
  for (const state of statesSet) {
      const stateRecords = [...historicalTrends.values()]
          .filter(t => t.state === state)
          .sort((a, b) => a.year - b.year);
          
      let lastPhcs = 0;
      let lastChcs = 0;
      let lastDoctors = 0;
      
      for (const rec of stateRecords) {
          if (rec.phcs_total === 0) rec.phcs_total = lastPhcs;
          else lastPhcs = rec.phcs_total;
          
          if (rec.chcs_total === 0) rec.chcs_total = lastChcs;
          else lastChcs = rec.chcs_total;
          
          if (rec.doctors_total === 0) rec.doctors_total = lastDoctors;
          else lastDoctors = rec.doctors_total;
      }
  }

  // 6. Insert Historical Trends
  for (const [key, data] of historicalTrends.entries()) {
      await pool.query(`
        INSERT INTO gov_historical_trends (state, year, phcs_total, chcs_total, doctors_total)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (state, year) DO UPDATE SET phcs_total = EXCLUDED.phcs_total, chcs_total = EXCLUDED.chcs_total, doctors_total = EXCLUDED.doctors_total
      `, [data.state, data.year, data.phcs_total, data.chcs_total, data.doctors_total]);
  }
  console.log(`Imported ${historicalTrends.size} historical trend records.`);

  console.log("Data import complete!");
  process.exit(0);
}

importData().catch(err => {
  console.error("Import failed:", err);
  process.exit(1);
});
