if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

const express = require('express')
const axios = require('axios')
const fs = require('fs')
const { response } = require('express')

const loginLink = 'https://myapi.ku.th/auth/login'
const getScheduleLink = 'https://myapi.ku.th/std-profile/getGroupCourse'
const sheetLink = process.env.SHEET_LINK

const appKey = process.env.APP_KEY

const app = express()

let using = 0
let stdCache = []

app.use( (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With,accesstoken');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
})

app.use(express.json())

app.post('/login', async (req, res) => {
  try {
    const response = await axios.post(loginLink, req.body, {
      headers: {
        'app-key': appKey
      }
    })
    using = using + 1;
    const student = response.data.user.student
    const { studentYear, facultyNameEn, majorNameEn, stdId } = student
    
    if (stdCache.indexOf(stdId) <= -1){
      stdCache.push(stdId);
    }
    
    if (response.data.code == "success") {
      console.log('Login success', facultyNameEn, ",", majorNameEn, ",", studentYear);
      console.log('Count:', using, ". Unique:", stdCache.length)
      try {
        const sheet_response = axios.post(sheetLink, 
          {
            "facultyNameEn": facultyNameEn,
            "majorNameEn": majorNameEn, 
            "studentYear": studentYear
          }
        )
        const concat = facultyNameEn + " , " + majorNameEn + " , " + studentYear
        console.log("add [",concat,"] to Sheet")
      }
      catch (e) {
        console.log(e)
        console.log("Fail to call Sheet API.")
      }
    }
    
    res.json(response.data)
  } catch (e) {
    res.status(e.response.status).json(e)
  }
})

app.get('/getSchedule', async (req, res) => {
  const accessToken = req.headers['accesstoken']
  const { stdId } = req.query
  try {
    const response = await axios.get(getScheduleLink, {
      params: {
        academicYear: 2564,
        semester: 1,
        stdId
      },
      headers: {
        "x-access-token": accessToken,
        'app-key': appKey
      }
    })
    console.log('GetSchedule')
    res.json(response.data.results[0].course)
  } catch (e) {
    try{
      res.status(e.response.status).json(e)
    } catch {
      console.log('GetSchedule Failed')
      res.status(400).json({
          "code": "bad request"
      })
    }
  }
})

const getNeedUnit = async (majorCode) => {
  let raw_major = fs.readFileSync('./genEd.json')
  const genEdJson = JSON.parse(raw_major)
  return genEdJson[majorCode]
}

const getSubject = async (subject_code) => {
  let raw_subject = fs.readFileSync('./subject.json')
  const subjectJson = JSON.parse(raw_subject)
  return subjectJson[subject_code]
}

app.get('/getGenEd', async (req, res) => {
  // body require:
  //  - MajorCode
  //  - x-access-token
  //  - stdCode - idcode # optional
  
  const accessToken = req.headers['accesstoken']
  const { majorCode, stdCode } = req.query
  
  try{
    const needUnit = await getNeedUnit(majorCode)
    console.log(needUnit)
    // console.log(needUnit['Wellness'])
    
    let result = {
      "Wellness": {
        "done": 0,
        "need": needUnit.Wellness,
        "subjects": []
      },
      "Entrepreneurship": {
        "done": 0,
        "need": needUnit.Entrepreneurship,
        "subjects": []
      },
      "Thai_Citizen_and_Global_Citizen": {
        "done": 0,
        "need": needUnit.Thai_Citizen_and_Global_Citizen,
        "subjects": []
      },
      "Language_and_Communication": {
        "done": 0,
        "need": needUnit.Language_and_Communication,
        "subjects": []
      },
      "Aesthetics": {
        "done": 0,
        "need": needUnit.Aesthetics,
        "subjects": []
      },
    }
    
    console.log(result)

    console.log(`checkGrades - getGenEd for ${majorCode}`)
    
    const response = await axios.get('https://myapi.ku.th/std-profile/checkGrades?idcode=6210545734', {
      headers: {
        'app-key': 'txCR5732xYYWDGdd49M3R19o1OVwdRFc',
        'x-access-token': accessToken
      },
      params: {
        'idcode': stdCode
      }
    })
    
    for(const year of response.data.results){
      // console.log(year.grade)
      for(const sub of year.grade){
      
        // console.log(sub.subject_code, sub.grade)
        const subject = await getSubject(sub.subject_code)
        // console.log(subject)
        if (sub.grade != 'W' && typeof subject !== 'undefined') {
          result[subject.type].done += sub.credit
          result[subject.type].subjects.push(sub)
        }
      }
    }
    
    console.log("success getGenEd")
    res.status(200).json(
      result
    )
  
  }
  catch (e) {
    console.log("fail getGenEd")
    // console.log(e)
    res.status(400).json({"msg": "fail to call api"})
  }
})

app.get('/getData', async (req, res) => {
  try{
    const response = await axios.get(sheetLink)
    // console.log(response.data)
    res.json(response.data)
  } catch (e){
    res.status(400).json({
      "code": "Fail to get data from sheet",
    })
  }
})

app.listen(process.env.PORT, () => console.log('Connected'))