const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
fs.writeFileSync('phc_west_dump.txt', lines[789] + '\n\n' + lines[816] + '\n\n' + lines[2477] + '\n\n' + lines[2835]);
