const fs = require('fs');

const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let line of lines) {
    if (line.includes('mockFacilities =')) {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('mockFacilities =')) {
            fs.writeFileSync('extracted_content.txt', obj.content);
            console.log('Extracted to extracted_content.txt');
            break;
        }
    }
}
