# KU-Table-server

server for https://ku-table.vercel.app/

host at https://ku-table-server.herokuapp.com/

```
yarn start
```

API:

- POST "/login":
  - require "username", "data"
- GET "/getSchedule"
  - require "accesstoken"
- GET "/getGenEd"
  - require "accesstoken", "majorCode", "stdCode"
- GET "/getData"
