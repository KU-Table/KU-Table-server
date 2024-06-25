if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

const loginLink = "https://myapi.ku.th/auth/login";
const getScheduleLink = "https://myapi.ku.th/std-profile/getGroupCourse";
const checkGradesLink = "https://myapi.ku.th/std-profile/checkGrades";
const publicCBP = "https://myapi.ku.th/common/publicCBP";
const sheetLink = process.env.SHEET_LINK;
const kuPublicKey = process.env.KU_PUBLIC_KEY.replace(/\\n/gm, "\n");
const appKey = process.env.APP_KEY;

const app = express();

let raw_subject = fs.readFileSync("./data/subject.json");
const subjectJson = JSON.parse(raw_subject);

let raw_major = fs.readFileSync("./data/newGenEd.json");
const genEdJson = JSON.parse(raw_major);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With,accesstoken"
  );

  if ("OPTIONS" == req.method) {
    res.send(200);
  } else {
    next();
  }
});

app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const encodedBody = {
      username: encodeString(req.body.username),
      password: encodeString(req.body.password),
    };
    const response = await axios.post(loginLink, encodedBody, {
      headers: {
        "app-key": appKey,
      },
    });

    const student = response.data.user.student;
    const { studentYear, facultyNameEn, majorNameEn, stdId, majorCode } =
      student;

    if (response.data.code == "success") {
      console.log(
        "Login/ Success",
        facultyNameEn,
        ",",
        majorCode,
        majorNameEn,
        ",",
        studentYear
      );
      try {
        axios.post(sheetLink, {
          facultyNameEn: facultyNameEn,
          majorNameEn: majorCode + " " + majorNameEn,
          studentYear: studentYear,
        });
      } catch (e) {
        console.log("Sheet/ Fail to call API.");
      }
      if (process.env.CBP_FLAG === "true") {
        try {
          axios.post(
            publicCBP,
            {
              keys: [["gcd", stdId]],
            },
            {
              headers: {
                "app-key": "txCR5732xYYWDGdd49M3R19o1OVwdRFc",
                "x-access-token": response.data.accesstoken,
              },
            }
          );
        } catch (e) {
          console.log("PublicCBP err: ", e);
        }
      }
    }

    res.status(response.status).json(response.data);
    console.log("Login/ Done");
  } catch (error) {

    const status = error.response ? error.response.status : 500;
    const message = error.response
      ? error.response.data.message
      : "Ku API Not Return Sucessfully";

    res.status(status).json({ message });
    console.log("Login/ Fail response.data.message: ", message);
  }
});

app.get("/getSchedule", async (req, res) => {
  const accessToken = req.headers["accesstoken"];
  const { stdId } = req.query;
  try {
    const header = {
      "x-access-token": accessToken,
      "app-key": appKey,
    };
    const response_now = await axios.get(getScheduleLink, {
      params: {
        stdId,
        academicYear: 2567,
        semester: 1,
      },
      headers: header,
    });
    console.log("GetSchedule success");
    console.log(response_now.data);
    if ("results" in response_now.data) {
      console.log("GetSchedule/ Done sent data success 2566/2");
      return res.json(response_now.data.results[0]);
    } else {
      const response_last = await axios.get(getScheduleLink, {
        params: {
          stdId,
          academicYear: 2566,
          semester: 2,
        },
        headers: header,
      });
      console.log(response_last.data);
      if ("results" in response_last.data) {
        console.log("GetSchedule/ Done sent data*2 success 2566/1");
        return res.json(response_last.data.results[0]);
      } else {
        console.log("GetSchedule/ Done but no course found (send default)");
        return res.json({
          course: [],
          peroid_date: "information not available",
        });
      }
    }
  } catch (e) {
    console.log(e.message);
    try {
      console.log("GetSchedule/ Fail, success ku api  Send blank table");
      return res.json({
        course: [],
        peroid_date: "information not available (Fail to GetSchedule/)",
      });
    } catch {
      res.status(400).json({ code: "bad request" });
      console.log("GetSchedule/ Fail, unsuccess ku api");
    }
  }
});

app.post("/encode", async (req, res) => {
  try {
    const encodedBody = {
      username: encodeString(req.body.username),
      password: encodeString(req.body.password),
    };
    return res.json(encodedBody);
  } catch (e) {
    return res.status(400).json({});
  }
});

const encodeString = (data) => {
  return crypto
    .publicEncrypt(
      {
        key: kuPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(data, "utf8")
    )
    .toString("base64");
};

const getNeedUnit = (majorCode, stdCode) => {
  const data = genEdJson[majorCode];
  if (!data) {
    console.log(`getNeedUnit/ Major Not found ${majorCode}`);
    return [genEdJson["NotFound"]["0"], 0];
  }
  try {
    const stdYear = stdCode.substring(0, 2);
    // 60 65
    // 64 -> 60
    // 65 -> 65
    var lastest = 60;
    for (const year in data) {
      if (year <= parseInt(stdYear)) {
        lastest = year;
      }
    }
    return [data[lastest], lastest];
  } catch {
    console.log("throw 60");
    return [data["60"], 60];
  }
};

const getSubject = (subject_code) => {
  return subjectJson[subject_code];
};

const getResultBlock = async (needUnit) => {
  let result = {
    Wellness: {
      done: 0,
      need: needUnit.Wellness,
      subjects: [],
    },
    Entrepreneurship: {
      done: 0,
      need: needUnit.Entrepreneurship,
      subjects: [],
    },
    Thai_Citizen_and_Global_Citizen: {
      done: 0,
      need: needUnit.Thai_Citizen_and_Global_Citizen,
      subjects: [],
    },
    Language_and_Communication: {
      done: 0,
      need: needUnit.Language_and_Communication,
      subjects: [],
    },
    Aesthetics: {
      done: 0,
      need: needUnit.Aesthetics,
      subjects: [],
    },
    unitYear: 0,
  };
  return result;
};

app.get("/getGenEd", async (req, res) => {
  // body require:
  //  - MajorCode
  //  - x-access-token
  //  - stdCode - idcode # optional

  const accessToken = req.headers["accesstoken"];
  const { majorCode, stdCode } = req.query;

  try {
    const [needUnit, unitYear] = getNeedUnit(majorCode, stdCode);
    // console.log(`checkGrades - getGenEd for ${majorCode}`)
    console.log(
      `GetGenEd/ checkGrades of ${majorCode}: ${needUnit.Wellness} ${needUnit.Entrepreneurship} ${needUnit.Thai_Citizen_and_Global_Citizen} ${needUnit.Language_and_Communication} ${needUnit.Aesthetics}`
    );
    // console.log(needUnit['Wellness'])

    let result = await getResultBlock(needUnit);

    const response = await axios.get(checkGradesLink, {
      headers: {
        "app-key": "txCR5732xYYWDGdd49M3R19o1OVwdRFc",
        "x-access-token": accessToken,
      },
      params: {
        idcode: stdCode,
      },
    });
    console.log("GetGenEd/ checkGrades code from ku:", response.data.code);
    if (!response.data.results) {
      console.log(response.data.message);
    } else {
      for (const year of response.data.results) {
        // console.log(year.grade)
        for (const sub of year.grade) {
          // console.log(sub.subject_code, sub.grade)
          const subject = getSubject(sub.subject_code);
          // console.log(subject)
          if (sub.grade != "W" && subject) {
            result[subject.type].done += sub.credit;
            result[subject.type].subjects.push(sub);
          }
        }
      }
    }

    result.unitYear = +unitYear || 0;

    res.status(response.status).json(result);
    console.log("GetGenEd/ Done Semester: ", response.data.results?.length);
  } catch (error) {
    console.error("GetGenEd Error:", error.message);

    const status = error.response ? error.response.status : 500;
    const message = error.response
      ? error.response.statusText
      : "Internal Server Error";

    res.status(status).json({ message });
    console.log("GetGenEd/ Failed");
  }
});

app.get("/getData", async (req, res) => {
  try {
    const response = await axios.get(sheetLink);
    // console.log(response.data)
    res.json(response.data);
  } catch (e) {
    res.status(400).json({
      code: "Sheet/ Fail to get data",
    });
  }
});

app.get("/getUpdatedNote", async (req, res) => {
  console.log("GetUpdatedNote");
  res.status(200).json({
    updated: [
      "[Jun 22, 2022] update table to semester 2565-1",
      "[Jun 22, 2022] new subject: 01355119 ทักษะการอ่านภาษาอังกฤษที่จําเป็น Language_and_Communication",
      "[Jun 22, 2022] new subject: 01355109 ทักษะการฟัง-การพูดภาษาอังกฤษที่จําเป็น Language_and_Communication",
      "[Jun 22, 2022] new subject: 01418102 เทคโนโลยีสารสนเทศเพื่อผู้ประกอบการ Entrepreneurs",
      "[Jun 22, 2022] new subject: 01387105 พุทธจริยศาสตร์ในการดำเนินธุรกิจ Entrepreneurs",
      "[Nov 29, 2021] new subject: 01132101 ผู้ประกอบการรุ่นใหม่ Entrepreneurs",
    ],
  });
});

app.listen(process.env.PORT, () => console.log("Connected"));
