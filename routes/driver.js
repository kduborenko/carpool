var driverDB = require('../db/driver');

exports.registerRoute = function (req, res) {
  var route = JSON.parse(req.query.route);
  var username = req.query.username;
  driverDB.registerRoute(username, route, function (err, route, companions) {
    res.send({
      status: "ok",
      routeId: route._id,
      companions: companions.map(function (companion) {
        var toPointView = function (point) {
          return {
            lat: point[1],
            lon: point[0]
          }
        };
        var byType = function (type) {
          return function (point) {
            return point.type == type
          }
        };
        return {
          companionId: companion._id,
          from: toPointView(companion.from),
          to: toPointView(companion.to)
        }
      })
    })
  });
};

exports.pickPassenger = function (req, res) {
  var companionId = req.params.companionId;
  var routeId = req.params.routeId;
  driverDB.pickPassenger(routeId, companionId, function (err) {
    res.send({
      status: "ok"
    })
  });
};