
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var companion = require('./routes/companion');
var driver = require('./routes/driver');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var https = require('https');      // module for https
var fs = require('fs');            // required to read certs and keys

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('ssl port', process.env.SSL_PORT || 3443);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/companion/get/:companionId', companion.get);
app.get('/companion/pickMe', companion.pickMe);
app.get('/companion/accept/:routeId/:companionId', companion.acceptDriver);
app.get('/driver/registerRoute', driver.registerRoute);
app.get('/driver/pickPassenger/:routeId/:companionId', driver.pickPassenger);
app.get('/driver/route/:routeId', driver.getRoute);
app.get('/user/:email', user.getUserInfo);
app.post('/login', user.login);

// SSL
var credentials = {
	key: fs.readFileSync('ssl/server.key'),
	cert: fs.readFileSync('ssl/server.crt'),
	ca: fs.readFileSync('ssl/ca.crt'),
	passphrase: 'kostoh4a',
	requestCert: false,
	rejectUnauthorized: false
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(app.get('port'), function(){
   console.log(' HTTP listening on port ' + app.get('port'));
});
httpsServer.listen(app.get('ssl port'), function(){
   console.log('HTTPS listening on port ' + app.get('ssl port'));
});
