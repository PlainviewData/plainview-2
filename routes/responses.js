var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Discussion = require('../models/discussion');
var Response = require('../models/response');
var responseTitle = require('../models/responseTitle');
var Account = require('../models/account');

router.post('/', function(req, res, next) {
	var signature = "";
	var created_by = "";
	if (req.user){
		signature = req.user.username;
		created_by = req.user._id;
	} else {
		signature = "Guest";
		created_by = "demouser";
	}
	var currentDiscussionId = req.body.discussionId;
	var newResponse = new Response({
		original_discussion: currentDiscussionId,
		title: req.body.responseTitle,
		text: req.body.responseText,
		created_by: created_by,
		signature: signature
	});
	newResponse.save(function(err, savedResponse){
		var relationship = {}
		var io = req.app.get('socketio');
		relationship[savedResponse.id] = {relatedResponse: req.body.relatedResponse, relationshipType: req.body.relationshipType};
		Discussion.findByIdAndUpdate(currentDiscussionId,
			{$push: {"responses": savedResponse.id, "relationships": relationship }},
			{safe: true, upsert: true},
			function (err, foundDiscussion) {
				if (err){
					console.log(err)
					res.send("error");
				} else {
					if (req.apiQuery){
						res.redirect('api/discussions/id/' + currentDiscussionId);
					} else {
						if (discussionClients[currentDiscussionId] !== undefined){
							discussionClients[currentDiscussionId].forEach(function(clientId){
									io.to(clientId).emit('newOriginalResponse', {discussionId: currentDiscussionId, newResponse: newResponse, relatedResponse: req.body.relatedResponse});
							})
						}
						res.send('OK')
					}
				}
			}
		);
	});
	if (req.user){
		Account.findByIdAndUpdate(req.user._id,
			{$push: {'responses': newResponse.id}},
			{safe: true, upsert: true}, function(err, updatedAccount){
				console.log(err)
			});
	}
	
	responseTitle.find({title: req.body.responseTitle}, function(err, foundResponse, num){
		if (foundResponse.length === 0){
			var newResponseTitle = new responseTitle({
				title: req.body.responseTitle
			});
			newResponseTitle.save(function(err, savedResponse){console.log(err)})
		}
	})
});

router.get('/', function(req, res, next) {
	Response.find({'$or': [
		{'title': {'$regex': req.query.response_query}},
		{'text': {'$regex': req.query.response_query}},
	]}, function(err, foundResponses){
		if (req.apiQuery){
			res.json({responses: foundResponses});
		} else {
			res.render('responses', {title: req.params.response_query, responses: foundResponses, user: req.user, response_query: req.query.response_query});
		}
	})
});

router.get('/featured', function(req, res, next) {
	req.body.filters = req.body.filters || {};
	Response.find(req.body.filters, function(err, foundResponses){
		if (req.apiQuery){
			res.json(foundResponses);
		} else {
			res.render('responses', {responses: foundResponses, user: req.user});
		}
	})
});

router.get('/id/:response_id([0-9a-f]{24})', function(req, res, next) {
	var responseId = mongoose.Types.ObjectId(req.params.response_id.toString());
	Response.findById(responseId, function (err, foundResponse) {
		if (req.apiQuery){
			res.json({responses: foundResponse});
		} else {
			res.render('response', {response: foundResponse, user: req.user});
		}
	});
});

router.get('/:response_query', function(req, res, next) {
	Response.find({'$or': [
			{'title': {'$regex': req.params.response_query}},
			{'text': {'$regex': req.params.response_query}},
			{'tags': {'$regex': req.params.response_query}},
		]}, function(err, foundResponses){
			if (req.apiQuery){
				res.json({responses: foundResponses});
			} else {
				res.render('responses', {title: req.params.response_query, responses: foundResponses, user: req.user});
			}
		})
});

router.get('/responseTitles/:response_query', function(req, res, next){
	responseTitle.find({ title : { "$regex": req.params.response_query, "$options": "i" } }, function(err, foundTitles){
		var titles = [];
		if (foundTitles !== undefined){
			foundTitles.forEach(function(title){
				titles.push(title.title);
		})
		}
		res.send(titles);
	})
})

router.put('/id/:response_id', function(req, res, next) {
	res.render('response', {});
});

router.delete('/id/:response_id', function(req, res, next) {
	
});

module.exports = router;

function validResponse(response){
	return true;
}

function getRegexFields(query){
	for (var field in query) {
		if (query.hasOwnProperty(field)) {
				query[field] = new RegExp(query[field], 'i')
		}
	}
	return query;
}
