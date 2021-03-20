var express = require('express');
var router = express.Router();
const yourhandle = require('countrycitystatejson');

/*GET countries states cities */ 
router.get('/', function(req, res, next) {
	res.status(200).send(yourhandle.getCountries());
});

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

module.exports = router;
