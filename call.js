const { default: axios } = require('axios')
const { json } = require('express')
const fs = require('fs')
const genEd = require('./genEd.json')

const idcode = '6210545734'
const majorCode = 'E17'
const accesstoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImI2MjEwNTQ1NzM0IiwidXNlcnR5cGUiOiIxIiwiaWRjb2RlIjoiNjIxMDU0NTczNCIsInN0ZGlkIjoiNTcxODMiLCJmaXJzdE5hbWVFbiI6IlBVVkFOQSIsImZpcnN0TmFtZVRoIjoi4Lig4Li54Lin4LiZIiwibGFzdE5hbWVFbiI6IlNXQVRWQU5JVEgiLCJsYXN0TmFtZVRoIjoi4Liq4Lin4Lix4Liq4LiU4Li04LmM4Lin4LiZ4Li04LiKIiwidGl0bGVUaCI6IuC4meC4suC4oiIsInJvbGVJZCI6bnVsbCwiaWF0IjoxNjI5NzQ0MzgxLCJleHAiOjE2Mjk3NDYxODF9.N_wc2kL1rm9CjH1OyANTgqxmYo1-lWjQlQjB8XemzuM'

axios.get('https://myapi.ku.th/std-profile/checkGrades?idcode=6210545734', {
    headers: {
      'app-key': 'txCR5732xYYWDGdd49M3R19o1OVwdRFc',
      'x-access-token': accesstoken
    },
    params: {
        'idcode': idcode
    }
}).then((resp) => {
    console.log(resp.data)
    
    let countW = 0, countP = 0, count = 0

    for(const year of resp.data.results){
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
}).then(() => {
    let raw_data = fs.readFileSync('./genEd.json');
    // const genEdJson = JSON.parse(raw_data)
    // console.log(genEdJson.E17)
    // const e17 = genEdJson.E17
    // console.log(e17.Wellness)
    // console.log(e17.Language_and_Communication)
    
}).catch((e) => {
    console.log(e)
})

// let raw_data = fs.readFileSync('./genEd.json')
// const getEdJson = JSON.parse(raw_data)
// console.log(getEdJson[majorCode]) 