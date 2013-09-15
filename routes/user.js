var social = require('./social');

exports.getUserInfo = function (req, res) {
  var email = req.params.email;
  social.getUserByEmail(
    email,
    function (userInfo) {
      res.send(userInfo)
    }
  );
};