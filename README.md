# ArogyaNet AI: Proactive District Health Intelligence

## Executive Summary
Healthcare management at the district level is often hindered by fragmented data, manual resource tracking, and delayed responses to emerging health crises. **ArogyaNet AI** is a comprehensive, centralized District Health Command Center solution that replaces reactive administrative hurdles with **proactive, AI-driven predictive health operations**. By aggregating real-time footfall, logistics, and disease surveillance data across Primary Health Centers (PHCs) and Community Health Centers (CHCs), ArogyaNet AI empowers administrators and healthcare staff to predict shortages, route ambulances dynamically, and neutralize localized outbreaks before they escalate.

## Key Technical Features
* **AI-Driven Bed Allocation & Logistics:** Real-time visibility into bed capacities, medical equipment statuses, and consumable stock, augmented by AI to forecast demand based on regional patient trends.
* **Predictive Procurement:** Intelligent AI scanning of daily health logs and disease reports to automatically identify critical shortages and recommend immediate procurements.
* **Redistribution Engine:** Autonomous generation of cross-facility redistribution manifests, optimizing resource usage (e.g., transferring surplus medicines from a CHC to a critically depleted PHC).
* **Role-Based Access Control (RBAC):** Tailored dashboards and functionality specifically designed for District Administrators, PHC/CHC Staff Officers, and Government Observers (MP/MLA).
* **Disease Surveillance & Alerts:** Granular patient footfall tracking combined with automated Command Center Alerts that instantly notify administrators of potential disease clusters and medical emergencies.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS, Lucide React (for iconography)
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (with complex JSONB aggregations)
* **AI Integration:** Google Vertex AI (Gemini 2.5 Flash) for data synthesis, forecasting, and NLP analysis

## Project Architecture
ArogyaNet AI operates on a robust microservices-inspired architecture. The React frontend interfaces with a Node.js API that directly connects to a PostgreSQL database serving as the single source of truth. The application heavily leverages **Google Vertex AI**—the AI Assistant operates as a localized intelligence layer, ingesting aggregated JSON snapshots of real-time database views (like `logistics_summary` and `daily_logs`). The AI processes this structured data instantly to return JSON-formatted insights, governance recommendations, and real-time alerts that are seamlessly rendered back into the user interface.

## Deployment & Setup Instructions

### Prerequisites
* Node.js (v18+)
* PostgreSQL installed and running locally

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd ArogyaNet-AI
```

### 2. Install Dependencies
Install both the frontend and backend dependencies:
```bash
npm install
cd server
npm install
cd ..
```

### 3. Configure PostgreSQL Database
1. Create a local PostgreSQL database named `arogyanet`.
2. Locate the database schema file at `server/db/schema.sql`.
3. Execute the schema file against your `arogyanet` database to create all tables and views, and to inject the seed data.
```bash
psql -U postgres -d arogyanet -f server/db/schema.sql
```

### 4. Configure Environment Variables
Create a `.env` file in the `server` directory and configure the following:
```env
# Database Credentials
DB_USER=postgres
DB_PASSWORD=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arogyanet

# Google Cloud Platform (Gemini Vertex AI)
GCP_PROJECT=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```
*Note: Ensure your GCP Service Account JSON key is placed in the `server` directory and named `service-account.json`.*

### 5. Run the Application
You will need to run the backend and frontend concurrently in two separate terminals.

**Terminal 1 (Backend Server):**
```bash
cd server
node index.js
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

## Testing Credentials
The database comes pre-seeded with the following accounts for immediate testing by hackathon judges:

* **District Administrator (Full Access):**
  * Username: `admin`
  * Password: `password`
* **PHC Staff (Facility Specific Access):**
  * Username: `phc-north`
  * Password: `password`
* **Government Observer (Read-Only AI Insights):**
  * Username: `mla_user`
  * Password: `password`
