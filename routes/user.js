var social = require('./social');
var http = require('http');

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
  var body = "";
  req.on('data',function (chunk) {
    body += chunk;
  }).on('end', function () {
      var fwd = http.request(
        {
          hostname: 'pmcmsq.epam.com',
          path: '/pmc/login.do',
          headers: req.headers,
          method: 'POST'
        },
        function (rs) {
          console.log(rs.statusCode)
          res.status(rs.statusCode)
          rs.on('data',function (chunk) {
            res.write(chunk)
          }).on('end', function () {
              res.send()
            })
        }
      );
      fwd.end(body);
    });
};