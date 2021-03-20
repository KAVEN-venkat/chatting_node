var express = require('express');
var router = express.Router();
var Users = require('../models/user');
var Roles = require('../models/role');
var Logintypes = require('../models/logintype');
var config = require('../config');
var bcrypt = require('bcryptjs');
var Token = require('../models/token');
var jwt = require('jsonwebtoken');
var dateFormat = require('dateformat');
const saltRounds = 14;

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

/* POST - users creation. */
router.post('/create', function (req, res) {
  var body = req.body;
  Roles.findOne({ "alias": body.role}).exec(function(err,role){
    body.role = role._id;
    Logintypes.findOne({ "alias": body.login_type}).exec(function(err,type){
      body.login_type = type._id;
      bcrypt.hash(body.password, saltRounds, function (err, hash) {
        body.password = hash;
        if(body.dob){
          var mydate = new Date(body.dob);
          var str = mydate.toString();
          body.dob = dateFormat(str,'yyyy-mm-dd');
        }
        Users.create(body, function (err, users) {
          console.log(err);
          if (err) {
            //res.emit(err)
            res.status(400).send({ status: false, message: err });
          }
          //res.json(users)
          res.status(200).send({ status: true, message: "ok", user:users });
        });
      });
    });
  });
})

router.post('/login', function (req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var ip = req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

      var query = Users.findOne({ "email": email });
  query.populate('role');
  query.populate('login_type');
  query.exec(function(err,post){
    if (err)
          res.send(err);
      if (post != null) {
          bcrypt.compare(password, post.password, function (err, check) {
              if (check == true) {
                  var payload = {
                      id: post._id,
                      role: post.role
                  };
                  var token = jwt.sign(payload, config.secret);
                  var d = new Date();
                  Token.create(
                      {
                          userId:post._id,
                          userId:post.username,
                          token: token,
                          issuedAt: d.toLocaleString(),
                          requestOriginIP: ip,
                          validity: "Valid"
                      }
                  );
                  //res.json({ message: "ok", token: token, users:post });
                  res.status(200).send({ status: true, message: "ok", token: token, users:post });
              } else {
                //res.json({ message: "passwords did not match" });
                res.status(400).send({ status: false, message: "Passwords did not match" });
              }
          });
      }
      else {
          res.json({ message: 'Incorrect Username' });
      }
  });
});

module.exports = router;
