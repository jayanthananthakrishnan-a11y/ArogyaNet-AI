const fs = require('fs');

const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let line of lines) {
    if (line.includes('app.get(\'/api/inventory/:center_id\'') && line.includes('mockLogistics')) {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('app.get(\'/api/inventory/:center_id\'')) {
            fs.writeFileSync('original_index.js.txt', obj.content);
            console.log('Extracted to original_index.js.txt');
            break;
        }
    }
}
