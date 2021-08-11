require('dotenv').config()

const express = require('express')
const axios = require('axios')
const cors = require('cors')

const appKey = process.env.APP_KEY

const app = express()

app.use(cors())
app.use(express.json())

app.post('/login', async (req, res) => {
  try {
    const response = await axios.post('https://myapi.ku.th/auth/login', req.body, {
      headers: {
        'app-key': appKey
      }
    })
    Logger.log("No Error while Login " + response.data)
    res.json(response.data)
  } catch (e) {
    Logger.log("Error while Login")
    res.json(e)
  }
})

app.get('/getSchedule', async (req, res) => {
  const accessToken = req.headers['accesstoken']
  const { stdId } = req.query
  try {
    const response = await axios.get('https://myapi.ku.th/std-profile/getGroupCourse', {
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
    res.json(response.data.results[0].course)
  } catch (e) {
    res.json(e)
  }
})

app.listen(process.env.PORT, () => console.log('Connected'))