const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.jsx')) {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    
    // Fix Dashboard and AdminRegistry missing > from previous script
    c = c.replace(/className="space-y-6 max-w-7xl mx-auto pb-10 font-sans"[\s]*</g, 'className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">\n<');

    // Fix import meta env quote errors in LandingPage, InventoryPage, etc.
    c = c.replace(/\$\{import\.meta\.env\.VITE_API_URL \|\| `'\}/g, "${import.meta.env.VITE_API_URL || ''}");
    
    // Fix MLADashboard context import
    c = c.replace(/import \{ useLanguage \} from '\.\.\/LanguageContext`;/g, "import { useLanguage } from '../LanguageContext';");

    // Fix CommandCenterPage `className="space-y-6 max-w-7xl mx-auto pb-10 font-sans"`
    c = c.replace(/className="space-y-6 max-w-7xl mx-auto pb-10 font-sans"([^>])/g, 'className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">$1');

    fs.writeFileSync(p, c);
  }
});
console.log('Fixed additional syntax without IDE tracking.');
