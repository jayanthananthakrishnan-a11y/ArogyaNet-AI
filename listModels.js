import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const keyLine = envContent.split('\n').find(line => line.startsWith('VITE_GEMINI_API_KEY='));
const key = keyLine ? keyLine.split('=')[1].trim() : '';

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    if (data.models) {
        data.models.forEach(m => console.log(m.name));
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
  } catch(e) {
    console.error(e);
  }
}

run();
