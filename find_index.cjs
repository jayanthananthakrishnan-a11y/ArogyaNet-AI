const fs = require('fs');
for(let i=1; i<=13; i++) {
    const data = fs.readFileSync(`extracted_${i}.txt`, 'utf8');
    if (data.includes('File Path: `file:///c:/Users/nithya/OneDrive/Desktop/Parliament_Hack2Skill/server/index.js`')) {
        console.log(`Found index.js in extracted_${i}.txt`);
    }
}
