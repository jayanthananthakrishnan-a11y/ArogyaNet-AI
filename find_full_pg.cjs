const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('File Path: `file:///c:/Users/nithya/OneDrive/Desktop/Parliament_Hack2Skill/server/index.js`')) {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('import { query } from')) {
            fs.writeFileSync('server_pg_full.txt', obj.content);
            console.log('Found full server/index.js from view_file');
            break;
        }
    }
}
