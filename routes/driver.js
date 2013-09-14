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
          to: toPointView(companion.to),
          pickupUrl: req.protocol + "://" + req.headers.host
            + "/driver/pickPassenger/" + route._id + "/" + companion._id
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

exports.getRoute = function (req, res) {
  var routeId = req.params.routeId;
  driverDB.byId(routeId, function (err, route) {
    if (route) {
      res.send({
        routeId: route._id,
        username: route.username,
        companions: route.companions ?
          route.companions.map(function (companion) {
            return {
              companionId: companion,
              companionUrl: req.protocol + "://" + req.headers.host + "/companion/get/" + companion
            }
          }) :
          null,
        from: route.route[0],
        to: route.route[route.route.length - 1],
        route: route.route
      });
    } else {
      res.status(404).send();
    }
  });
};