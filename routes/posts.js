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

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        var tmpfolder_name = path.parse(file.originalname).name;
        if (file.fieldname === "images") {
            var dir = 'public/uploads/posts/';
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true})
        }
        cb(null, dir);
    },
    // By default, multer removes file extensions so let's add them back
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

function uploadFile(req, res, next) {
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            //console.log(file.originalname);
            var tmpfolder_name = path.parse(file.originalname).name;
            if (file.fieldname === "images") {
                var dir = 'public/uploads/posts/' + tmpfolder_name;
            }
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, {recursive: true})
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
        }
    });
    const upload = multer({storage: storage, fileFilter: function (req, file, cb) {
            cb(null, true);
        }}).fields([
        {name: 'images', maxCount: 10},
    ]);

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE")
            {
                console.log('error', 'Upload file size should be 2mb or below in ' + err.field + ' field!');
            }
            // A Multer error occurred when uploading.
        } else if (err) {
            console.log('error', 'Error occured while upload ' + err);
            // An unknown error occurred when uploading.
        }
        // Everything went fine. 
        next();
    });
}
async function removeFolder(folder) {
  try {
    await fsextra.remove(folder)
    //done
  } catch (err) {
    console.error(err)
  }
}

/* GET All posts. */

router.get('/', function (req, res) {
  var query = Posts.find({ deleted_at:null });
  query.populate('tagged_user','_id first_name last_name profile_image');
  query.populate({
    path: 'commentIds',
    populate: { path: 'commented_by',select:'_id first_name last_name profile_image' },
    populate: { path: 'tagged_user',select:'_id first_name last_name profile_image'}
  });
  query.populate({
    path: 'likeIds',
    populate: { path: 'liked_by',select:'_id first_name last_name profile_image' }
  });
  query.populate('posted_by','_id first_name last_name profile_image');
  query.exec(function(error,posts){
    if (error) {
      console.log(error);
      res.status(400).send({ status: false, message: error });
    }
    res.status(200).send({ status: true, message: "ok", posts:posts });
  });
});

/* POST - post creation. */

router.post('/',function (req, res) {
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('images', 10);
  upload(req, res, function(err) {
      var body = req.body;
      if (req.fileValidationError) {
        return res.send(req.fileValidationError);
      }else if (!req.files) {
        return res.send('Please select an image to upload');
      }else if (err instanceof multer.MulterError) {
        return res.send(err);
      }else if (err) {
        return res.send(err);
      }
      var imageData = [];
      const files = req.files;
      let index, len;
      if(files.length > 0){
        for (index = 0, len = files.length; index < len; ++index) {
          imageData.push(files[index].filename);
        }
      }
      body.images = imageData;
      body.posted_by = req.user.id;
        
      Posts.create(body, function (err, post) {
        if (err) {
          res.status(400).send({ status: false, message: err });
        }
        if(files.length > 0){
          if (!fs.existsSync('public/uploads/posts/'+post._id+'/')) {
            fs.mkdirSync('public/uploads/posts/'+post._id+'/', {recursive: true})
          }
          for (index = 0, len = files.length; index < len; ++index) {
            moveFile(files[index].path, 'public/uploads/posts/'+post._id+'/'+files[index].filename);
            //removeFolder(files[index].destination);
          }
        }
        res.status(200).send({ status: true, message: "ok", post:post });
      });
    });
});

/* GET Single posts. */

router.get('/:id', function (req, res) {
  var query = Posts.findOne({ '_id':req.params.id, deleted_at:null });
  query.populate('tagged_user','_id first_name last_name profile_image');
  query.populate({
    path: 'commentIds',
    populate: { path: 'commented_by',select:'_id first_name last_name profile_image' },
    populate: { path: 'tagged_user',select:'_id first_name last_name profile_image'}
  });
  query.populate({
    path: 'likeIds',
    populate: { path: 'liked_by',select:'_id first_name last_name profile_image' }
  });
  query.exec(function(error,post){
    if (error) {
      console.log(error);
      res.status(400).send({ status: false, message: error });
    }
    res.status(200).send({ status: true, message: "ok", post:post });
  });
});

router.put('/:id', function (req, res) {
  let upload = multer({ storage: storage, fileFilter: helpers.imageFilter }).array('images', 10);
  upload(req, res, function(err) {
      var body = req.body;
      if (req.fileValidationError) {
        return res.send(req.fileValidationError);
      }else if (!req.files) {
        return res.send('Please select an image to upload');
      }else if (err instanceof multer.MulterError) {
        return res.send(err);
      }else if (err) {
        return res.send(err);
      }
      var imageData = [];
      const files = req.files;
      let index, len;
      if(files.length > 0){
        for (index = 0, len = files.length; index < len; ++index) {
          imageData.push(files[index].filename);
        }
      }
      if(body.old_images && body.old_images.length  > 0){
        body.images = body.old_images.concat(imageData);
      }else{
        body.images = imageData;
      }
      console.log(body.tagged_user);
      var tagged_users = [];
      if(body.tagged_user != undefined){
        for(let i = 0; i < body.tagged_user.length;i++){
          console.log(body.tagged_user[i]);
          if(body.tagged_user[i] != ''){
          tagged_users.push(body.tagged_user[i]);
          }
        }
      }
      //console.log(body.tagged_user);
      var myquery = {_id:req.params.id};
      if(tagged_users.length > 0){
      var newvalues = {$set:{content:body.content,images:body.images,tagged_user:tagged_users,updated_at:new Date()}};
      }else{
      var newvalues = {$set:{content:body.content,images:body.images,updated_at:new Date()}};
      }
      Posts.updateOne(myquery, newvalues, function(err, post) {
        if (err) {
          res.status(400).send({ status: false, message: err });
        }
        if (!fs.existsSync('public/uploads/posts/'+req.params.id+'/')) {
          fs.mkdirSync('public/uploads/posts/'+req.params.id+'/', {recursive: true})
        }
        if(files.length > 0){
          for (index = 0, len = files.length; index < len; ++index) {
            moveFile(files[index].path, 'public/uploads/posts/'+req.params.id+'/'+files[index].filename);
            //removeFolder(files[index].destination);
          }
        }
        res.status(200).send({ status: true, message: "Post updated successfully.", post:post });
      });
  });
});

router.delete('/:id', function(req, res){
  var myquery = {_id:req.params.id};
  var newvalues = {$set:{deleted_at:new Date()}};
  Posts.updateOne(myquery, newvalues, function(err, post) {
    if (err) {
      res.status(400).send({ status: false, message: err });
    }
    res.status(200).send({ status: true, message: "Post deleted successfully.", post:post });
  });
});

module.exports = router;
