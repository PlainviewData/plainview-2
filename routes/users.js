var express = require('express');
var router = express.Router();
var Account = require('../models/account');
var Response = require('../models/response');
var Discussion = require('../models/discussion');

router.get('/', function(req, res, next) {

});

router.get('/demouser', function(req,res,next){
	res.redirect('/responses');
})

router.get('/:user_id', function(req, res, next) {
	Account.findOne({slug: req.params.user_id}, function(err, foundAccount){
		if (foundAccount){
			Response.find({
				'_id': { $in: foundAccount.responses}
			}, function (err, foundResponses) {
				Discussion.find({
					'_id': { $in: foundAccount.discussions}
				}, function (err, foundDiscussions) {
					if (req.isAuthenticated() && ''+req.user._id == ''+foundAccount._id) {
						res.render('profile', {user: req.user, discussions: foundDiscussions, responses: foundResponses});
					} else {
						res.render('users', {user: foundAccount, discussions: foundDiscussions, responses: foundResponses});
					}
				});
			});
		} else {
			next();
		}
	});
});

router.post('/', function(req, res, next) {
  
});

router.put('/:user_id', function(req, res, next) {
  res.render('profile', {});
});

router.delete('/:user_id', function(req, res, next) {
  
});

module.exports = router;
