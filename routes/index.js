var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Discussion = require('../models/discussion');
var Response = require('../models/response');


/* GET home page. */
router.get('/', function(req, res, next) {
  Response.find({}, function(err, result, count){
    res.send('/public/index.html')
  })
});

module.exports = router;
