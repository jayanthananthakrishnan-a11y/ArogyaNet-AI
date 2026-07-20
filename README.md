# ArogyaNet AI

ArogyaNet AI is a comprehensive, AI-powered healthcare intelligence platform for India. It bridges the gap between massive national datasets and actionable intelligence, offering a robust **Public Portal** for citizens alongside a secure, multi-tenant **Command Center** for administrators, health staff, and government officials.

## Architecture

1. **Government Datasets**: Raw healthcare data representing national infrastructure, demographics, and operations.
2. **ETL Pipeline**: Extracts, transforms, and securely loads the health data.
3. **PostgreSQL Database**: The central data warehouse that robustly stores relational tables for both public datasets and application logic.
4. **Express Backend APIs**: Provides scalable RESTful endpoints, applying role-based access control and token-based authentication.
5. **React Frontend**: A highly responsive, modern UI powered by Vite, Tailwind CSS, Framer Motion, and React Router.
6. **Citizen Portal + Command Center**: The dual-facing application layer separating public access from secure operations.

## Features

### Public Portal (Citizen Facing)
- **National Health Intelligence**: Data visualizations for overall national health performance.
- **State Insights**: Drill-down analytics and trend mapping per state.
- **District Explorer**: Real-time lookup of infrastructure specific to granular district localities.
- **Citizen AI Assistant**: An integrated Google Vertex AI / Gemini powered assistant helping users navigate public health resources.
- **Emergency SOS**: Rapid emergency reporting functionality.
- **Contact System**: An integrated email dispatching contact form.

### Command Center (Internal Operations)
- **Admin Dashboard**: Absolute oversight, registry management, and system-wide configurations.
- **Staff Dashboard**: Local operational tooling for inventory, surveillance, and daily patient logging.
- **MLA/Government View**: Higher-level strategic governance recommendations and predictive footfall insights.
- **Logistics & Alerts**: Real-time resource redistribution requests and predictive alerts.

---

## Setup Instructions

### 1. Database Setup
ArogyaNet uses PostgreSQL. 
1. Create a local PostgreSQL database.
2. Import the schemas and tables (found in the root/database directory or backup scripts).
3. Update your `.env` connection string.

### 2. Environment Variables
Create a `.env` file in the root of the project (copy from `.env.example`).
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/arogyanet

# Authentication
JWT_SECRET=your_admin_secret
CITIZEN_JWT_SECRET=your_citizen_secret

# AI
GEMINI_API_KEY=your_api_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### 3. Backend Setup
The backend runs on Express/Node.js.
```bash
cd server
npm install
node index.js
```
The server defaults to port `5000`.

### 4. Frontend Setup
The frontend runs on React + Vite.
```bash
# In the root directory
npm install
npm run dev
```

---

## Demo Credentials

> **IMPORTANT**: The following credentials are provided strictly for demonstration and hackathon testing purposes. They should NEVER be used in a production environment. Please rotate or delete these accounts before deploying live.

**District Administrator**
- Username: `admin`
- Password: `password`

**PHC Staff**
- Username: `phc-north`
- Password: `password`

**Government Observer (MLA)**
- Username: `mla_user`
- Password: `password`
