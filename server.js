if(process.env.NODE_ENV !== "production"){
  require('dotenv').config()
}

const express = require('express')
const axios = require('axios')

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
        // // call google sheet script.
        // if (sheet_response.data.status == "success") {
        //   const concat = facultyNameEn + "-" + majorNameEn + "-" + studentYear
        //   if (sheet_response.data.mode == "increase") {
        //     console.log("Sheet Count++ for", concat);
        //   }
        //   else if (sheet_response.data.mode == "new") {
        //     console.log("Sheet add new", concat)
        //   }
        // }
        // // fail to add or increase new data
        // else {
        //   console.log("Sheet POST failed.")
        // }
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

app.get('/getData', async (req, res) => {
  try{
    const response = await axios.get(sheetLink)
    console.log(response.data)
    res.json(response.data)
  } catch (e){
    res.status(400).json({
      "code": "Fail to get data from sheet",
    })
  }
})

app.listen(process.env.PORT, () => console.log('Connected'))