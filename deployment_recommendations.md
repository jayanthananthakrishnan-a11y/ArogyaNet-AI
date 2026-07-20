# ArogyaNet AI Deployment Recommendations

This document outlines the recommended architecture and configurations for deploying ArogyaNet AI to a production environment.

## 1. Overall Architecture

For a scalable and highly available deployment, we recommend decoupling the frontend, backend, and database components.

*   **Frontend (React/Vite):** Vercel or Netlify
*   **Backend (Express/Node.js):** Render, Railway, or AWS Elastic Beanstalk
*   **Database (PostgreSQL):** Supabase, Neon, or AWS RDS

## 2. Frontend Deployment (Vercel)

Vercel provides excellent out-of-the-box support for Vite/React applications.

1.  Connect your GitHub repository to Vercel.
2.  Set the Framework Preset to **Vite**.
3.  Build Command: `npm run build`
4.  Output Directory: `dist`
5.  **Environment Variables:** Add `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://api.arogyanet.example.com`).

## 3. Backend Deployment (Render / Railway)

Render or Railway are ideal for deploying Node.js applications with minimal configuration.

1.  Connect your GitHub repository.
2.  Set the Build Command: `npm install`
3.  Set the Start Command: `node index.js`
4.  **Environment Variables:**
    *   `DATABASE_URL`: The connection string provided by your managed database provider.
    *   `JWT_SECRET`: A strong, randomly generated string for Command Center authentication.
    *   `CITIZEN_JWT_SECRET`: A strong, randomly generated string for Citizen Portal authentication.
    *   `GEMINI_API_KEY`: Your valid Google Vertex AI / Gemini API key.
    *   `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: Your email service provider credentials (e.g., SendGrid, Mailgun, or Google App Passwords).
    *   `PORT`: `5000` (or leave blank if the platform automatically assigns it).

## 4. Database Deployment (Neon / Supabase)

1.  Provision a new PostgreSQL database.
2.  Obtain the connection URI (e.g., `postgresql://user:password@host/dbname?sslmode=require`).
3.  Run your database initialization and ETL scripts against this production database to seed the government datasets and initial user accounts.

## 5. Security Checklist Before Going Live

*   [x] Ensure all demo credentials are removed from the frontend code (already completed).
*   [ ] Rotate the passwords for the `admin`, `phc-north`, and `mla_user` accounts directly in the PostgreSQL database.
*   [ ] Ensure `CORS` in `server/index.js` is configured to only allow requests from your specific Vercel frontend domain.
*   [ ] Ensure HTTPS is enforced across all platforms.
*   [x] Verify no `.env` files or API keys have been committed to GitHub.
