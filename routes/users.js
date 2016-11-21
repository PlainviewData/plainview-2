var express = require('express');
var router = express.Router();
var Account = require('../models/account');
var Response = require('../models/response');
var Discussion = require('../models/discussion');

router.get('/', function(req, res, next) {
  	console.log(req.user._id);
});

router.get('/id/:user_id', function(req, res, next) {
	Account.findOne({_id: req.params.user_id}, function(err, foundAccount){
		if (foundAccount){
			if (''+req.user._id == ''+foundAccount._id) {
				res.redirect('/profile');
			} else {
				Response.find({
					'_id': { $in: foundAccount.responses}
				}, function (err, foundResponses) {
					Discussion.find({
						'_id': { $in: foundAccount.discussions}
					}, function (err, foundDiscussions) {
						res.render('users', {user: foundAccount, discussions: foundDiscussions, responses: foundResponses});
					});
				});
			}
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
