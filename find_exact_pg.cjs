const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('UPDATE logistics SET itemPayload = $1')) {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('UPDATE logistics SET itemPayload = $1')) {
            fs.writeFileSync('server_pg_exact.txt', obj.content);
            console.log('Extracted exact postgres code!');
            break;
        }
    }
}
