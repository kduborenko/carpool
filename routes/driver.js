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
            lat: point.loc[0],
            lon: point.loc[1]
          }
        };
        var byType = function (type) {
          return function (point) {
            return point.type == type
          }
        };
        return {
          companionId: companion._id,
          from: companion.points.filter(byType("from")).map(toPointView)[0],
          to: companion.points.filter(byType("to")).map(toPointView)[0]
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
      status: "ok",
      rs: err
    })
  });
};