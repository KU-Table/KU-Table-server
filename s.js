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
      console.log(response.data)
      
      // if (stdCache.indexOf(stdId) <= -1){
      //   stdCache.push(stdId);
      // }
      
      if (response.data.code == "success") {
        console.log('Login/ success', facultyNameEn, ",", majorCode, majorNameEn, ",", studentYear);
        // console.log('Count:', using, ". Unique:", stdCache.length)
        try {
          axios.post(sheetLink, 
            {
              "facultyNameEn": facultyNameEn,
              "majorNameEn": majorCode + " " + majorNameEn, 
              "studentYear": studentYear
            }
          )
          const concat = facultyNameEn + " , " + majorCode + " " + majorNameEn + " , " + studentYear
          console.log("Sheet/ [", concat, "] has been added to Sheet")
        }
        catch (e) {
          console.log(e)
          console.log("Sheet/ Fail to call API.")
        }
      }
      
      res.json(response.data)
      console.log("Login/ Done")
  
    } catch (e) {
      try{
        res.status(e.response.status).json(e)
        console.log("Login/ Fail, success ku api")
      } catch {
        res.status(400).json({"code" :"Fail to login"})
        console.log("Login/ Fail, unsuccess ku api")
      }
    }
  })