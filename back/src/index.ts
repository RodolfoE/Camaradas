"use strict";
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require('./config/database');
import { authRouter } from './routes/index';
var app = express();
// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')));
const databasePool = config.getDbPool();
app.use(async function (req: any, res: any, next: any) {
    req.pool = await databasePool;
    next();
});
app.use('/authentication', authRouter);
// catch 404 and forward to error handler
app.use(function (req: any, res: any, next: any) {
    next(createError(404));
});


// error handler
app.use(function (err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.sendStatus(err.status || 500);
});


export const init = () => {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}
