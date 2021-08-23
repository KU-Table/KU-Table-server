const t_json = require('./t.json')

// console.log(t_json)
// console.log(t_json.results.flat(Infinity))

// t_json.reduce((year) => {
    
// })

let countW = 0, countP = 0, count = 0

for(const year of t_json.results){
    // console.log(year.grade)
    for(const sub of year.grade){
    
        console.log(sub.subject_code, sub.grade)
        
        if(sub.grade == 'W'){
            countW += sub.credit
        }
        else if(sub.grade == 'P'){
            countP += sub.credit
        }
        else{
            count += sub.credit
        }
        
    }
}

console.log(countW, countP, count)