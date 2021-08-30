if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

const express = require('express')
const axios = require('axios')
const fs = require('fs')
const { response } = require('express')

const loginLink = 'https://myapi.ku.th/auth/login'
const getScheduleLink = 'https://myapi.ku.th/std-profile/getGroupCourse'
const checkGradesLink = 'https://myapi.ku.th/std-profile/checkGrades'
const sheetLink = process.env.SHEET_LINK

const appKey = process.env.APP_KEY

const app = express()

// let using = 0
// let stdCache = []

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
    // using = using + 1;
    const student = response.data.user.student
    const { studentYear, facultyNameEn, majorNameEn, stdId, majorCode } = student
    
    // if (stdCache.indexOf(stdId) <= -1){
    //   stdCache.push(stdId);
    // }
    
    if (response.data.code == "success") {
      console.log('Login success', facultyNameEn, ",", majorCode, majorNameEn, ",", studentYear);
      // console.log('Count:', using, ". Unique:", stdCache.length)
      try {
        const sheet_response = axios.post(sheetLink, 
          {
            "facultyNameEn": facultyNameEn,
            "majorNameEn": majorCode + " " + majorNameEn, 
            "studentYear": studentYear
          }
        )
        const concat = facultyNameEn + " , " + majorCode + " " + majorNameEn + " , " + studentYear
        console.log("[", concat, "] has been added to Sheet")
      }
      catch (e) {
        console.log(e)
        console.log("Fail to call Sheet API.")
      }
    }
    
    res.json(response.data)
    console.log("Done Login process")

  } catch (e) {
    try{
      res.status(e.response.status).json(e)
      console.log("Fail Login process, success ku api")
    } catch {
      res.status(400).json({"code" :"Fail to login"})
      console.log("Fail Login process, unsuccess ku api")
    }
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
    console.log('GetSchedule success')
    res.json(response.data.results[0].course)
    console.log('Done sent GetSchedule data success')
  } catch (e) {
    try{
      res.status(e.response.status).json(e)
      console.log("Fail GetSchedule process, success ku api")
    } catch {
      res.status(400).json({"code": "bad request"})
      console.log("Fail GetSchedule process, unsuccess ku api")
    }
  }
})

const getNeedUnit = async (majorCode) => {
  let raw_major = fs.readFileSync('./data/genEd.json')
  const genEdJson = JSON.parse(raw_major)
  if(!genEdJson[majorCode]){
    console.log(`Major Not found ${majorCode}`)
  }
  return genEdJson[majorCode] || genEdJson["NotFound"]
}

const getSubject = async (subject_code) => {
  let raw_subject = fs.readFileSync('./data/subject.json')
  const subjectJson = JSON.parse(raw_subject)
  return subjectJson[subject_code]
}

const getResultBlock = async (needUnit) => {
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
  return result
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
    // console.log(`checkGrades - getGenEd for ${majorCode}`)
    console.log(`checkGrades - getGenEd of ${majorCode}: ${needUnit.Wellness} ${needUnit.Entrepreneurship} ${needUnit.Thai_Citizen_and_Global_Citizen} ${needUnit.Language_and_Communication} ${needUnit.Aesthetics}`)
    // console.log(needUnit['Wellness'])
    
    let result = await getResultBlock(needUnit)

    const response = await axios.get(checkGradesLink, {
      headers: {
        'app-key': 'txCR5732xYYWDGdd49M3R19o1OVwdRFc',
        'x-access-token': accessToken
      },
      params: {
        'idcode': stdCode
      }
    })
    console.log("checkGrades code from ku:", response.data.code)
    
    for(const year of response.data.results){
      // console.log(year.grade)
      for(const sub of year.grade){
      
        // console.log(sub.subject_code, sub.grade)
        const subject = await getSubject(sub.subject_code)
        // console.log(subject)
        if (sub.grade != 'W' && subject) {
          result[subject.type].done += sub.credit
          result[subject.type].subjects.push(sub)
        }
      }
    }

    res.status(200).json(
      result
    )
    console.log("Done getGenEd. semester:", response.data.results.length)
  }
  catch (e) {
    try{
      console.log(e.response.status, e.response.statusText)
      res.status(e.response.status).json({"msg": e.response.statusText})
      console.log("Fail getGenEd, success call ku api")
    } catch (er) {
      res.status(400).json({"msg": "fail to getGenEd"})
      console.log("Fail getGenEd, unsuccess call ku api")
    }
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