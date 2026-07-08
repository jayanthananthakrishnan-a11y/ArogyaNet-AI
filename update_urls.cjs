const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.jsx')) {
    const p = path.join(dir, f);
    let c = fs.readFileSync(p, 'utf8');
    if (c.includes('http://localhost:5000')) {
      c = c.replace(/http:\/\/localhost:5000/g, "${import.meta.env.VITE_API_URL || ''}");
      fs.writeFileSync(p, c);
      console.log('Updated ' + f);
    }
  }
});
