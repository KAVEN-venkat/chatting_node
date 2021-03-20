var express = require('express');
var router = express.Router();
const yourhandle = require('countrycitystatejson');

/*GET countries states cities */ 
router.get('/:country', function(req, res, next) {
	console.log(req.params);
	res.status(200).send(yourhandle.getStatesByShort(req.params.country));
});

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

module.exports = router;