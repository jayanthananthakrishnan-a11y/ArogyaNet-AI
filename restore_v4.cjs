const fs = require('fs');
const lines = fs.readFileSync('server_index_v4.txt', 'utf8').split('\n');
let code = [];
let started = false;
for (let line of lines) {
    if (line.match(/^\d+:/)) {
        started = true;
        code.push(line.replace(/^\d+:\s/, ''));
    } else if (started) {
        break;
    }
}
fs.writeFileSync('server/index.js', code.join('\n'));
