import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    config = config || {};
    
    const adminToken = sessionStorage.getItem('adminToken');
    
    // Check if the resource is a Command Center API
    // We do NOT attach adminToken to public APIs, login APIs, or if an Authorization header already exists
    const isApiRequest = typeof resource === 'string' && resource.includes('/api/');
    const isPublicOrLogin = typeof resource === 'string' && (resource.includes('/api/public/') || resource.includes('/api/login'));
    
    if (adminToken && isApiRequest && !isPublicOrLogin) {
        config.headers = {
            ...config.headers
        };
        // Only add Authorization if it doesn't already exist (e.g., if Citizen token is being used explicitly)
        const hasAuth = Object.keys(config.headers).some(key => key.toLowerCase() === 'authorization');
        if (!hasAuth) {
            config.headers['Authorization'] = `Bearer ${adminToken}`;
        }
    }
    
    return originalFetch(resource, config);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
