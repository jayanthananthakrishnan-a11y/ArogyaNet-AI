const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let latestServerContent = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
             for (let tc of obj.tool_calls) {
                 if (tc.function && tc.function.name === 'write_to_file' || tc.function.name === 'replace_file_content') {
                     const args = JSON.parse(tc.function.arguments);
                     if (args.TargetFile && args.TargetFile.includes('server\\index.js')) {
                         // found a modification
                         // But we want the full file, let's just find the last view_file
                     }
                 }
             }
        }
    } catch(e) {}
}
