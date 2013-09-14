var driverDB = require('../db/driver');

exports.registerRoute = function (req, res) {
  var route = JSON.parse(req.query.route);
  var username = req.query.username;
  driverDB.registerRoute(username, route, function (err, doc) {
    res.send({
      status: "ok",
      id: doc._id
    })
  });
};

exports.pickPassenger = function (req, res) {
  var companionId = req.params.companionId;
  var routeId = req.params.routeId;
  driverDB.pickPassenger(routeId, companionId, function (err) {
    res.send({
      status: "ok",
      rs: err
    })
  });
};