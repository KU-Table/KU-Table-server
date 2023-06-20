const fs = require('fs')

let raw_data = fs.readFileSync('./data/genEd.json')
const genEdJson = JSON.parse(raw_data)

let new_json = {}

for (const key in genEdJson) {
    const ge = genEdJson[key]
    
    new_json[key] = {
        "60": ge
    }
}

fs.writeFile("newGenEd.json", JSON.stringify(new_json), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});