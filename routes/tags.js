var express = require('express');
var router = express.Router();
var Discussion = require('../models/discussion');

router.get('/', function(req, res, next) {
	res.render('tags', {});
});

router.get('/:tag', function(req, res, next) {
	Discussion.find({'tags': req.params.tag}, function(err, foundDiscussions, num){
		res.render('discussions', {discussions: foundDiscussions, num: num, tag: req.params.tag});
	})
});

module.exports = router;
