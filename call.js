const { default: axios } = require('axios')
const fs = require('fs')

const idcode = '6210545734'

axios.get('https://myapi.ku.th/std-profile/checkGrades?idcode=6210545734', {
    headers: {
      'app-key': 'txCR5732xYYWDGdd49M3R19o1OVwdRFc',
      'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImI2MjEwNTQ1NzM0IiwidXNlcnR5cGUiOiIxIiwiaWRjb2RlIjoiNjIxMDU0NTczNCIsInN0ZGlkIjoiNTcxODMiLCJmaXJzdE5hbWVFbiI6IlBVVkFOQSIsImZpcnN0TmFtZVRoIjoi4Lig4Li54Lin4LiZIiwibGFzdE5hbWVFbiI6IlNXQVRWQU5JVEgiLCJsYXN0TmFtZVRoIjoi4Liq4Lin4Lix4Liq4LiU4Li04LmM4Lin4LiZ4Li04LiKIiwidGl0bGVUaCI6IuC4meC4suC4oiIsInJvbGVJZCI6bnVsbCwiaWF0IjoxNjI5NjY1MDA3LCJleHAiOjE2Mjk2NjY4MDd9.G1tJV4Tn35bjZelAyK98oZRYvzyfqH1ufwnuwZlSQzU'
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
}).catch((e) => {
    console.log(e)
})

