var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload')
var cors = require('cors')

require('dotenv').config();
var session = require('express-session');
var breadcrumb = require('express-url-breadcrumb');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/admin/login');
var adminRouter = require('./routes/admin/inicio');
var novedadesRouter = require('./routes/admin/novedades');
var eventosRouter = require('./routes/admin/eventos');
var lanzamientosRouter = require('./routes/admin/lanzamientos');
var apiRouter = require('./routes/api')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'diplomatura',
  resave: false,
  saveUninitialized: true
}));

secured = async (req, res, next) => {
  try {
    console.log(req.session.id_usuario);
    if (req.session.id_usuario){
      next();
    }else {
      res.redirect('/admin/login');
    }
  } catch (error){
    console.log(error);
  }
};

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

app.use(breadcrumb());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/admin/login', loginRouter);
app.use('/admin/inicio', secured, adminRouter);
app.use('/admin/novedades', secured, novedadesRouter);
app.use('/admin/eventos', secured, eventosRouter);
app.use('/admin/lanzamientos', secured, lanzamientosRouter);
app.use('/api', cors(), apiRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
