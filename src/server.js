const express = require('express')
const path = require('path')
const app = express()
const { testConnection } = require('./database/db');
require('dotenv').config();

const configViewEngine = require('./config/ViewEngine');
const webRouters = require('./routes/api');
const port = process.env.PORT|| 8888;
const host_name = process.env.HOST_NAME;

configViewEngine(app);
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/',webRouters)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
}) 
testConnection();