var config = require('./config');

var express = require('express');
var app = express();
var socket_io = require( "socket.io" );
var io = socket_io();
app.io = io;
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
// app.use(require('express-session')({
// 	secret: 'keyboard cat',
// 	resave: false,
// 	saveUninitialized: false
// }))
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RedisStore = require('connect-redis')(session);
app.use(session({ store: new RedisStore({
		url: '//redis-10842.c8.us-east-1-4.ec2.cloud.redislabs.com',
		port: 10842,
		pass: 'Mtchair2'
	}), 
	secret: 'Mtchair2',
	resave: false,
	saveUninitialized: false
}));

var routes = require('./routes/index');
var api = require('./routes/api');
var users = require('./routes/users');
var discussions = require('./routes/discussions');
var responses = require('./routes/responses');
var tags = require('./routes/tags');

discussionClients = {};

mongoose.connect(config.database);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.set('socketio', io);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

app.use('/', routes);
app.use('/api', api);
app.use('(/api)?/users', users);
app.use('(/api)?/discussions', discussions);
app.use('(/api)?/responses', responses);
app.use('(/api)?/tags', tags);

app.get('/about', function(req, res, next){
	res.render('about', {});
})

app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});


if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		var status404;
		console.log(err.status)
		if (err.status == 404){
			status404 = true;
		}
		res.render('error', {
			message: err.message,
			status404: status404,
			user: req.user
		});
	});
}

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	var status404;
	console.log(err.status)
	if (err.status == 404){
		console.log('hi')
		status404 = true;
	}
	res.render('error', {
	message: err.message,
	status404: status404,
	user: req.user
	});
});

io.on( "connection", function( socket ) {
	socket.on("viewingDiscussion", function(id){
		if (discussionClients[id] === undefined){
			discussionClients[id] = [socket.id];
		} else {
			discussionClients[id].push(socket.id);
		}
	})
});


module.exports = app;
