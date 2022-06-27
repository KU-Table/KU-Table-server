const e = require("express");

app.post('/login', async(req, res) => {
    try {
        const data = await login(req.body)
        const student = data.user.student;
        const { studentYear, facultyNameEn, majorNameEn, majorCode } = student

        console.log('Login/ success', facultyNameEn, ",", majorCode, majorNameEn, ",", studentYear);
        await saveSheet(student);
    }
    catch (err) {
        if (err instanceof InvalidLoginError) {
            res.status(403).json({message: err.message})
        }
        else if (err instanceof SheetError) {
            res.json(data)
        }
        else {
            console.log("login/ error", err)
            res.status(500).json({message: "internal server error"})
        }
    }
})

async function login(payload) {
    try {
        const response = await axios.post(loginLink, payload, {
            headers: {
              'app-key': appKey
            }
        })
        return response.data
    }
    catch (err) {
        if (err instanceof AxiosError) {
            throw new InvalidLoginError('Invalid login')
        }
        throw err
    } 
}

async function saveSheet(student) {
    try {
        const { studentYear, facultyNameEn, majorNameEn, majorCode } = student
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
    catch (err) {
        if (err instanceof AxiosError) {
            throw new SheetError('Sheet Fail')
        }
        throw err
    }
}

class BusinessError extends Error {

    constructor(message) {
        super(message);
    }

    isError(err) {
        if (err instanceof this) {
            throw new constructor(err.message)
        }
    }
}

class InvalidLoginError extends BusinessError {

    constructor(message) {
        super(message);
    }
}

class SheetError extends BusinessError {

    constructor(message) {
        super(message)
    }
}