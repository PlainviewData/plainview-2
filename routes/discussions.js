var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Discussion = require('../models/discussion');
var Account = require('../models/account');
var Response = require('../models/response');
var responseTitle = require('../models/responseTitle');
var Tag = require('../models/tag');

router.get('/', function(req, res, next) {
	if (res.apiQuery){
		res.json({})
	} else {
		res.render('discussions', {user: req.user});
	}
});

router.get('/new', function(req, res, next) {
	if (req.user){
		res.render('new-discussion', {user: req.user});
	} else {
		res.render('login');
	}
});

router.get('/id/:discussion_id([0-9a-f]{24})', function(req, res, next) {
	var discussionId = mongoose.Types.ObjectId(req.params.discussion_id.toString());
	Discussion.findById(discussionId, function (err, foundDiscussion) {
		if (foundDiscussion) {
			if (foundDiscussion.public === false){
				if (req.user){
					if (foundDiscussion.participants.indexOf(req.user._id) !== -1){
						Response.find({
							'_id': { $in: foundDiscussion.responses}
						}, function (err, foundResponses) {
							if (req.apiQuery){
								res.json({discussion: foundDiscussion, responses: foundResponses});
							} else {
								res.render('discussion', {discussionId: discussionId, user: req.user});
							}
						})
					} else {
						res.send("Unauthorized");
					}
				} else {
					res.render('login');
				}
			} else {
				Response.find({
					'_id': { $in: foundDiscussion.responses}
				}, function (err, foundResponses) {
					if (req.apiQuery){
						res.json({discussion: foundDiscussion, responses: foundResponses});
					} else {
						res.render('discussion', {discussionId: discussionId, user: req.user});
					}
				})
			}
		}
	});
});

router.post('/', function(req, res, next) {
	if (req.user){
		var newResponse = new Response({
			isLink: false,
			title: req.body.responseTitle,
			text: req.body.responseText,
			created_by: req.user._id,
			signature: req.user.username
		});

		var relationship = {}
		relationship[newResponse._id.toString()] = {relatedResponse: "", relationshipType: "root"};

		var tags = req.body.tags.split(" ");

		var newDiscussion = new Discussion({
			title: req.body.responseTitle,
			tags: tags,
			public: req.body.visibility == 'public',
			created_by: req.user.first_name + " " + req.user.last_name,
			responses: [newResponse._id],
			relationships: [relationship],
			participants: [req.user._id],
			signature: req.user.username
		});

		newResponse.original_discussion = newDiscussion._id;

		newResponse.save(function(err, savedResponse){
				newDiscussion.save(function(err, savedDiscussion) {
					res.redirect('/discussions/id/' + newDiscussion._id);
				});
		});
		
		responseTitle.find({title: req.body.responseTitle}, function(err, foundResponse, num){
			if (foundResponse !== undefined && foundResponse.length === 0){
				var newResponseTitle = new responseTitle({
					title: req.body.responseTitle
				});
				newResponseTitle.save(function(err, savedResponse){})
			}
		})
		Account.findByIdAndUpdate(req.user._id,
			{$push: {'discussions': newDiscussion.id, 'responses': newResponse._id}}, 
			{safe: true, upsert: true}, function(err, foundAccount){}
		)
		tags.forEach(function(tag){
			Tag.findOne({label: tag}, function(err, tagFound){
				if (tagFound === null){
					var newTag = new Tag({
						label: tag,
						discussions_using: 1
					});
					newTag.save(function(err, savedTag){
						console.log(savedTag);
					});
				} else {
					tagFound.discussions_using = tagFound.discussions_using + 1;
					console.log(tagFound);
					tagFound.save();
				}
			})
		})

	} else {
		res.render('login');
	}
});

router.post('/addCitationToDiscussion', function(req, res, next){
	var citation = JSON.parse(req.body.citation)
	var io = req.app.get('socketio');
	var relationship = {}
	relationship[citation._id] = {relatedResponse: req.body.relatedResponse, relationshipType: req.body.relationshipType};
	Discussion.findByIdAndUpdate(req.body.discussionId,
		{$push: {"responses": citation._id, "relationships": relationship, "citations": citation._id}},
		{safe: true, upsert: true},
		function (err, foundDiscussion) {
			if (discussionClients[req.body.discussionId] !== undefined){
					discussionClients[req.body.discussionId].forEach(function(clientId){
							io.to(clientId).emit('newCitationResponse', {discussionId: req.body.discussionId, citation: citation, relatedResponse: req.body.relatedResponse});
					})
			}
			res.send('OK')
		}
	);
})

router.put('/id/:discussion_id([0-9a-f]{24})', function(req, res, next) {
	res.render('discussion', {});
});

router.delete('/id/:discussion_id', function(req, res, next) {
	
});

module.exports = router;

function validDiscussion(discussion){
	return true;
}
