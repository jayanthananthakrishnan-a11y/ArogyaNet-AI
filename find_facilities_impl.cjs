const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('app.post(\\'/api/facilities/register\\'') && line.includes('server/index.js')) {
        try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
                fs.writeFileSync('found_facilities_impl.txt', JSON.stringify(obj.tool_calls, null, 2));
                console.log('Found /api/facilities/register implementation');
                break;
            }
        } catch(e) {}
    }
}
