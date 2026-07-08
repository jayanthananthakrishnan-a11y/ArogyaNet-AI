const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let latestPool = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('File Path: `file:///c:/Users/nithya/OneDrive/Desktop/Parliament_Hack2Skill/server/db/pool.js`') && line.includes('Showing lines 1 to')) {
        try {
            const obj = JSON.parse(line);
            if (obj.content) {
                const match = obj.content.match(/Total Lines: (\d+)/);
                const showingMatch = obj.content.match(/Showing lines (\d+) to (\d+)/);
                
                if (match && showingMatch && match[1] === showingMatch[2]) {
                    latestPool = obj.content;
                }
            }
        } catch(e) {}
    }
}

if (latestPool) {
    fs.writeFileSync('full_simulated_pool.txt', latestPool);
    console.log('Extracted full simulated pool.js!');
}
