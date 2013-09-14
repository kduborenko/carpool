var companionDB = require('../db/companion');

exports.pickMe = function (req, res) {
  var from = JSON.parse(req.query.from);
  var to = JSON.parse(req.query.to);
  var username = req.query.username;
  companionDB.pickMe(username, from, to, function (err, doc) {
    res.send({
      status: "ok",
      id: doc._id
    });
  });
};