
const fs = require('fs')

let raw_subject = fs.readFileSync('./data/subject.json')
const subjectJson = JSON.parse(raw_subject)

var m = new Map();

for (const [key, value] of Object.entries(subjectJson)) {
    console.log(value.type);
    if (!m.has(value.type)) {
        m.set(value.type, 1)
    } else {
        m.set(value.type, m.get(value.type) + 1)
    }
}

console.log(m)