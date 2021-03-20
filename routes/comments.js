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
  var query = Comments.find({ deleted_at:null });
  query.exec(function(error,comments){
    if (error) {
      console.log(error);
      res.status(400).send({ status: false, message: error });
    }
    res.status(200).send({ status: true, message: "ok", comments:comments });
  });
});

/* POST - post creation. */

router.post('/',function (req, res) {
  var body =req.body;
  body.commented_by = req.user.id;
  Comments.create(body, function (err, comment) {
    if (err) {
      res.status(400).send({ status: false, message: err });
    }
    Posts.findOne({'_id':body.post_id}).exec(function(err,post){
      if (err) {
        res.status(400).send({ status: false, message: err });
      }
      let commentedIds = [];
      if(post.commentIds.length > 0){
      commentedIds = post.commentIds;
      }
      commentedIds.push(comment._id);
      var myquery = {_id:body.post_id};
      var newvalues = {$set:{commentIds:commentedIds}};
      console.log(newvalues);
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

router.put('/:id', function (req, res) {
  var body = req.body;
  var tagged_users = [];
  for(let i = 0; i < body.tagged_user.length;i++){
    console.log(body.tagged_user[i]);
    if(body.tagged_user[i] != ''){
    tagged_users.push(body.tagged_user[i]);
    }
  }
  var myquery = {_id:req.params.id};
  var newvalues = {$set:{content:body.content,tagged_user:tagged_users,updated_at:new Date()}};
  Comments.updateOne(myquery, newvalues, function(err, comment) {
    if (err) {
      res.status(400).send({ status: false, message: err });
    }
    res.status(200).send({ status: true, message: "Comment updated successfully.", comment:comment });
  });
});

router.delete('/:id', function(req, res){
  var body = req.body;
  var myquery = {_id:req.params.id};
  var newvalues = {$set:{deleted_at:new Date()}};
  Comments.updateOne(myquery, newvalues, function(err, post) {
    if (err) {
      res.status(400).send({ status: false, message: err });
    }
    Posts.findOne({'_id':body.post_id}).exec(function(err,post){
      if (err) {
        res.status(400).send({ status: false, message: err });
      }
      let commentedIds = [];
      if(post.commentIds.length > 0){
      commentedIds = post.commentIds;
      commentedIds.remove(req.params.id);
      }
      var myquery = {_id:body.post_id};
      var newvalues = {$set:{commentIds:commentedIds}};
      Posts.updateOne(myquery, newvalues, function(err, post) {
        if (err) {
          console.log(err);
          res.status(400).send({ status: false, message: err });
        }
        res.status(200).send({ status: true, message: "Comment deleted successfully.", post:post });
      });
    });    
  });
});

module.exports = router;
