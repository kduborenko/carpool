var driverDB = require('../db/driver');
var companionDB = require('../db/companion');
var social = require('./social');

exports.registerRoute = function (req, res) {
  var route = JSON.parse(req.query.route);
  var username = req.query.username;
  driverDB.registerRoute(username, route, function (err, route, companions) {
    function resolveUpsaInfo(index, companions, cb) {
      social.getUserByEmail(companions[index].username, function (userInfo) {
        companions[index].upsaInfo = userInfo;
        if (++index < companions.length) {
          resolveUpsaInfo(index, companions, cb);
        } else {
          cb.call(null, companions);
        }
      })
    }

    resolveUpsaInfo(0, companions, function (companions) {
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
            username: companion.username,
            image: companion.upsaInfo ? "https://upsa.epam.com/workload/photo/" + companion.upsaInfo.id : null,
            from: toPointView(companion.from),
            to: toPointView(companion.to),
            upsaInfo: companion.upsaInfo,
            pickupUrl: req.protocol + "://" + req.headers.host
              + "/driver/pickPassenger/" + route._id + "/" + companion._id
          }
        })
      })
    });
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
      function resolveUpsaInfo(index, companions, cb) {
        companionDB.byId(companions[index].companionId.toString(), function (err, companion) {
          companions[index].username = companion.username;
          social.getUserByEmail(companion.username, function (userInfo) {
            companions[index].upsaInfo = userInfo;
            if (++index < companions.length) {
              resolveUpsaInfo(index, companions, cb);
            } else {
              cb.call(null, companions);
            }
          })
        })
      }

      var companions = route.companions ?
        route.companions.map(function (companion) {
          return {
            companionId: companion,
            companionUrl: req.protocol + "://" + req.headers.host + "/companion/get/" + companion
          }
        }) :
        null;

      resolveUpsaInfo(0, companions, function (companions) {
        res.send({
          routeId: route._id,
          username: route.username,
          companions: companions,
          from: route.route[0],
          to: route.route[route.route.length - 1],
          route: route.route
        });
      });
    } else {
      res.status(404).send();
    }
  });
};