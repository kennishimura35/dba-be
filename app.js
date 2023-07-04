require('dotenv').config()
const serverless = require('serverless-http');
const express = require('express')
const http = require('http');
const https = require('https');
const fs = require('fs');
const multer = require('multer');
const BodyParser = require('body-parser')
const cors = require('cors')
const { errors } = require('celebrate');

const routes = require('./src/routes');
const { BadRequest } = require('./src/helper/ResponseUtil');


const app = express()
const port = process.env.SERVER_PORT
// some error
// const whitelist = ['localhost', 'ptbsp.ddns.net']
app.use(cors())
app.use(BodyParser.json()) //limit upload file
app.use(BodyParser.urlencoded({extended:true})); //limit upload file

// register route filter
app.all('/*')

// register base path '/'
app.get('/', (req, res) => res.send(`${process.env.APP_NAME} - ${process.env.APP_VERSION}`))

app.use('/photos', express.static('photos'));

// register all route under '/api'
app.use('/api/v1', routes)

// register error handler from Joi->Celebrate
app.use(errors())

/**
 * Middleware: Error handling
 */ 
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      BadRequest(res, 'Ukuran file terlalu besar. Max 3 mb')
    }
  }
});

// var httpServer = http.createServer(app);
// // var httpsServer = https.createServer(credentials, app);

// httpServer.listen(port, () => console.log(`Server started, listening on port ${port}!`));
// // httpsServer.listen(443, () => console.log(`Server started, listening on port 443!`));

module.exports = app;
module.exports.api = serverless(app, { binary: ['*/*'] });