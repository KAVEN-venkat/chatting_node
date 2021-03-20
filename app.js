var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Config = require('./config');
var mongoose = require('mongoose');
var jwt = require('express-jwt');
var multer  = require('multer');
const yourhandle= require('countrycitystatejson');

var indexRouter = require('./routes/index');
var countriesRouter = require('./routes/countries');
var statesRouter = require('./routes/states');
var citiesRouter = require('./routes/cities');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var commentsRouter = require('./routes/comments');
var likesRouter = require('./routes/likes');

const connection = mongoose.connection;
var roles = [{
  name:'Super Admin',
  alias: 'super_admin',
},{
  name:'User',
  alias: 'user',
},{
  name:'Page',
  alias: 'page',
}];
var logintypes = [{name:'General',alias:'general'},{name:'Facebook',alias:'facebook'},{name:'Google',alias:'google'}];
connection.once("open", function() {
  console.log("MongoDB database connection established successfully");
    //connection.collection('login_type').insertMany(logintypes);
    roles.forEach(ele => {
      connection.collection('roles').findOne({alias: ele.alias}, function(err, items) {
        if(err) {
          return console.log('findOne error:', err);
        }
        if(items == null){
          connection.collection("roles").insertOne({ name: ele.name, alias: ele.alias }, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            //connection.close();
          });
        }
      });
    });
    logintypes.forEach(type => {
      connection.collection('logintypes').findOne({alias: type.alias}, function(err, items) {
        if(err) {
          return console.log('findOne error:', err);
        }
        if(items == null){
          connection.collection("logintypes").insertOne({ name: type.name, alias: type.alias }, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            //connection.close();
          });
        }
      });
    });
});

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }
};

var app = express();

mongoose.Promise = require('bluebird');
mongoose.connect( process.env.MONGODB_URI || Config.mongodb_local, { promiseLibrary: require('bluebird'),useUnifiedTopology: true,useNewUrlParser: true })
  .then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(allowCrossDomain);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(jwt({ secret: Config.secret }).unless({
    path: [
      '/', '/users', '/users/login', '/users/create','/roles/create', '/countries',  /^\/states\/.*/, /^\/cities\/.*/
    ]
}));

app.use('/', indexRouter);
app.use('/countries', countriesRouter);
app.use('/states', statesRouter);
app.use('/cities', citiesRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/likes', likesRouter);

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