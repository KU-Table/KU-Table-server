# KU-Table-server

server for https://ku-table.vercel.app/

Welcome for pr and plugin
Also need GenEd data

host at https://ku-table-server.herokuapp.com/

```
yarn start
```

API:

- POST "/login":
  - require "username", "password"
- GET "/getSchedule"
  - require "accesstoken"
- GET "/getGenEd"
  - require "accesstoken", "majorCode", "stdCode"
- GET "/getData" get web using data
