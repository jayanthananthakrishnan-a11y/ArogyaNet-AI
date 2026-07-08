const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('mockUsers =') || line.includes('mockUsers:')) {
        try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
                 fs.writeFileSync('mockUsers_found.txt', JSON.stringify(obj.tool_calls, null, 2));
                 console.log('Found mockUsers!');
                 break;
            }
        } catch(e) {}
    }
}
