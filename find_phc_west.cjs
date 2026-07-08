const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('PHC-WEST') || line.includes('PHC-SOUTH')) {
        console.log('Found PHC-WEST or PHC-SOUTH at line ' + i);
        // Let's print the first 5 matches to see what file it was in!
    }
}
