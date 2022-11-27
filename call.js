const { default: axios } = require('axios')
const { json } = require('express')
const fs = require('fs')
const genEd = require('./genEd.json')

const idcode = ''
const majorCode = ''
const accesstoken = ''

axios.get('https://myapi.ku.th/std-profile/checkGrades?idcode=', {
    headers: {
      'app-key': '',
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