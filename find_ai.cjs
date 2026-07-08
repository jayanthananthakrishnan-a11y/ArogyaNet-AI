const fs = require('fs');
const transcriptPath = 'C:\\Users\\nithya\\.gemini\\antigravity-ide\\brain\\eb26c368-36bb-469f-b94d-e3c4a46636b4\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('/api/chatbot') && line.includes('server/index.js') && !line.includes('find_chatbot.cjs')) {
        try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
                fs.writeFileSync('chatbot_impl.txt', JSON.stringify(obj.tool_calls, null, 2));
                console.log('Found chatbot code');
                break;
            }
        } catch(e) {}
    }
}

for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('/api/district/redistribution') && line.includes('server/index.js')) {
        try {
            const obj = JSON.parse(line);
            if (obj.tool_calls) {
                fs.writeFileSync('redistribution_impl.txt', JSON.stringify(obj.tool_calls, null, 2));
                console.log('Found redistribution code');
                break;
            }
        } catch(e) {}
    }
}
