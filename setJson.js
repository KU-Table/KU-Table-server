const fs = require('fs')

let raw_data = fs.readFileSync('./subt.json');
const genEdJson = JSON.parse(raw_data)


let new_json = {}

for (var key in genEdJson) {
    if (genEdJson.hasOwnProperty(key)) {
        // console.log(key + " -> " + genEdJson[key]);
        const sub = genEdJson[key]
        let ele = {
            "type": ['Wellness', "Entrepreneurship", "Thai_Citizen_and_Global_Citizen", "Language_and_Communication", "Aesthetics"][sub[0] - 1],
            "nameEN": sub[1],
            "nameTH": sub[2],
            "unit": sub[3],
            "hour": sub[4],
            "faculty": sub[5]
        }
        new_json[key] = ele
        // console.log(ele)
        // console.log(['Wellness', "Entrepreneurship", "Thai_Citizen_and_Global_Citizen", "Language and Communication", "Aesthetics"][genEdJson[key][0] - 1])
    }
}

fs.writeFile("subject.json", JSON.stringify(new_json), err => {
     
    // Checking for errors
    if (err) throw err; 
   
    console.log("Done writing"); // Success
});