var express = require('express');
var router = express.Router();
var Users = require('../models/user');
var Roles = require('../models/role');
var Logintypes = require('../models/logintype');
var Posts = require('../models/post');
var Comments = require('../models/comment');
var Likes = require('../models/like');
var config = require('../config');
var bcrypt = require('bcryptjs');
var Token = require('../models/token');
var jwt = require('jsonwebtoken');
var dateFormat = require('dateformat');
var multer  = require('multer');
var path  = require('path');
const helpers = require('../helpers');
var fs = require('fs');
const fsextra = require('fs-extra')
const moveFile = require('move-file');
const saltRounds = 14;

/* GET All comments. */

router.get('/', function (req, res) {
  
});

/* POST - post creation. */

router.post('/',function (req, res) {
  var body =req.body;
  body.liked_by = req.user.id;
  Likes.create(body, function (err, like) {
    if (err) {
      res.status(400).send({ status: false, message: err });
    }
    Posts.findOne({'_id':body.post_id}).exec(function(err,post){
      if (err) {
        res.status(400).send({ status: false, message: err });
      }
      let likedIds = [];
      if(post.likeIds.length > 0){
      likedIds = post.likeIds;
      }
      likedIds.push(like._id);
      var myquery = {_id:body.post_id};
      var newvalues = {$set:{likeIds:likedIds}};
      Posts.updateOne(myquery, newvalues, function(err, post) {
        if (err) {
          console.log(err);
          res.status(400).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: "ok", post:post });
      });
    });
  });
});

router.delete('/:id', function(req, res){
  var body = req.body;
  var myquery = {_id:req.params.id};
  var newvalues = {$set:{deleted_at:new Date()}};
  Likes.updateOne(myquery, newvalues, function(err, like) {
    if (err) {
      res.status(400).send({ status: false, message: err });
    }
    Posts.findOne({'_id':body.post_id}).exec(function(err,post){
      if (err) {
        res.status(400).send({ status: false, message: err });
      }
      let likedIds = [];
      if(post.likeIds.length > 0){
      likedIds = post.likeIds;
      }
      likedIds.push(like._id);
      var myquery = {_id:body.post_id};
      var newvalues = {$set:{likeIds:likedIds}};
      Posts.updateOne(myquery, newvalues, function(err, post) {
        if (err) {
          console.log(err);
          res.status(400).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: "ok", post:post });
      });
    });    
  });
});

module.exports = router;
