var crypto = require('crypto');
var http = require("http");
var _ = require("underscore");

exports.getUserByEmail = function (email, cb) {
  httpGet(
    {
      hostname: "social.epam.com",
      port: 80,
      path: "/api/1.0/employee/search?pageNumber=0&pageSize=1&query=" + email,
      method: "GET"
    },
    "goog-hackathon",
    "Sj3KDd397d2",
    function (err, data) {
      data = JSON.parse(data);
      var users = data.result.content.filter(function (userInfo) {
        return userInfo.email == email;
      });
      cb.call(null, users.length == 0 ? null : users[0]);
    }
  );
};


function httpGet(options, username, password, cb) {
  http.get(options, function (res) {
    res.setEncoding('utf-8');
    var challengeParams = parseDigest(res.headers['www-authenticate'])
    var ha1 = md5(username + ':' + challengeParams.realm + ':' + password)
    var ha2 = md5('GET:' + options.path)
    var response = md5(ha1 + ':' + challengeParams.nonce + ':1::auth:' + ha2)
    var authRequestParams = {
      username: username,
      realm: challengeParams.realm,
      nonce: challengeParams.nonce,
      uri: options.path,
      qop: challengeParams.qop,
      response: response,
      nc: '1',
      cnonce: ''
    };
    options.headers = { 'Authorization': renderDigest(authRequestParams) }
    http.get(options, function (res) {
      res.setEncoding('utf-8');
      var content = '';
      res.on('data',function (chunk) {
        content += chunk
      }).on('end', function () {
          cb.call(null, null, content)
        })
    });
  });

  function parseDigest(header) {
    return _(header.substring(7).split(/,\s+/)).reduce(function (obj, s) {
      var parts = s.split('=')
      obj[parts[0]] = parts[1].replace(/"/g, '')
      return obj
    }, {})
  }

  function renderDigest(params) {
    var s = _(_.keys(params)).reduce(function (s1, ii) {
      return s1 + ', ' + ii + '="' + params[ii] + '"'
    }, '');
    return 'Digest ' + s.substring(2);
  }

  function md5(text) {
    var md5 = crypto.createHash('md5');
    md5.update(text);
    return md5.digest('hex');
  }
}