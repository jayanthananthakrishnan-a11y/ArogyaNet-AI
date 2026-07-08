const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('File Path: `file:///c:/Users/nithya/OneDrive/Desktop/Parliament_Hack2Skill/server/db/pool.js`')) {
        try {
            const obj = JSON.parse(line);
            if (obj.content && obj.content.includes('Showing lines 1 to')) {
                fs.writeFileSync('pool_js_dump.txt', obj.content);
                console.log('Found full pool.js');
                break;
            }
        } catch(e) {}
    }
}
