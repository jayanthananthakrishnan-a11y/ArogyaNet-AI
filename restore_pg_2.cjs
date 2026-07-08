const fs = require('fs');
const lines = fs.readFileSync('server_pg_full.txt', 'utf8').split('\n');
let code = [];
for (let line of lines) {
    if (line.match(/^\d+:/)) {
        code.push(line.replace(/^\d+:\s/, ''));
    }
}
fs.writeFileSync('server/index.js', code.join('\n'));
