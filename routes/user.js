var social = require('./social');
var http = require('http');
var https = require('https');

exports.getUserInfo = function (req, res) {
  var email = req.params.email;
  social.getUserByEmail(
    email,
    function (userInfo) {
      res.send(userInfo)
    }
  );
};

exports.login = function (req, res) {
  var body = '';
  var options = {
    hostname: 'pmcmsq.epam.com',
    path: '/pmc/login.do',
    rejectUnauthorized: false
  };

  req.on('data', function (chunk) {
    body += chunk;
    console.log(body);
  }).on('end', function () {
    console.log('res.end');
    openPmc(options, res, body);
  });
};

_clone = function(obj) {
  if (obj == null || typeof(obj) != 'object') {
    return obj;
  }
  var temp = obj.constructor(); // changed
  for (var key in obj) {
    temp[key] = _clone(obj[key]);
	}
  return temp;
};

openPmc = function(options, answer, body) {
  https.get(options, function (res) {
    console.log('openPmc.res: ', res.statusCode);
    console.log('openPmc.headers: ', res.headers['set-cookie']);
    cookie = res.headers['set-cookie'][0].split(';')[0];
    res.on('data', function() {
      console.log('openPmc.data');
    });
    res.on('end', function () {
      console.log('openPmc.end');
      console.log('Cookie: ', cookie);
      initPmc(options, cookie, answer, body);
    });
  });
};

initPmc = function(options, cookie, answer, body) {
  var initOptions = _clone(options);
  initOptions.path += '?tz=GMT%2D07:00';
  var headers = {
    'Cookie': cookie,
  };
  initOptions.headers = headers;

  https.get(initOptions, function (res) {
    console.log('initPmc.res: ', res.statusCode);
    res.on('data', function() {
      console.log('initPmc.data');
    });
    res.on('end', function () {
      console.log('initPmc.end');
      loginPmc(options, cookie, answer, body);
    });
  });
};

loginPmc = function(options, cookie, answer, body) {
  var loginOptions = _clone(options);
  var headers = {
    'Cookie': cookie,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  loginOptions.headers = headers;
  loginOptions.method = 'POST';
  var request = https.request(loginOptions, function (res) {
    console.log('loginPmc.Res: ', res.statusCode);
    console.log('loginPmc.location: ', res.headers.location);
    if (res.statusCode == 302 && res.headers.location && res.headers.location.indexOf('home.do') != -1) {
      answer.status(200);
    } else {
      answer.status(401);
    }

    res.on('data', function() {
      console.log('loginPmc.data');
    });
    res.on('end', function () {
      console.log('loginPmc.end');
      answer.send()
    });
  });
  request.end(body);
};
