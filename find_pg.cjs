const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('UPDATE logistics SET itempayload')) {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('UPDATE logistics SET itempayload')) {
            fs.writeFileSync('server_postgres.txt', obj.content);
            console.log('Found full server/index.js with Postgres fix');
            break;
        }
    }
}
