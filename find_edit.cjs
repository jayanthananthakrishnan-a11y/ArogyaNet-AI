const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('app.post(\\'/api/inventory/edit\\', async (req, res) => {')) {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('app.post(\\'/api/inventory/edit\\', async (req, res) => {')) {
            fs.writeFileSync('found_edit_endpoint.txt', obj.content);
            console.log('Found edit endpoint diff');
            break;
        }
    }
}
