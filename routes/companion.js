var companionDB = require('../db/companion');
var social = require('./social');
var driverDB = require('../db/driver');

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

exports.get = function (req, res) {
  var companionId = req.params.companionId;
  companionDB.byId(companionId, function (err, companion) {
    function renderResponse(routes) {
      res.send({
        companionId: companion._id,
        username: companion.username,
        lookingForDriver: companion.lookingForDriver || false,
        from: {
          lat: companion.from[1],
          lon: companion.from[0]
        },
        to: {
          lat: companion.to[1],
          lon: companion.to[0]
        },
        routesProposals: routes
      });
    }

    if (companion) {
      var routes = companion.routes_proposals ?
        companion.routes_proposals.map(function (routeId) {
          return {
            routeId: routeId,
            routeUrl: req.protocol + "://" + req.headers.host
              + "/driver/route/" + routeId,
            acceptDriverUrl: req.protocol + "://" + req.headers.host
              + "/companion/accept/" + routeId + "/" + companion._id
          }
        }) :
        null;

      if (routes) {
        resolveUpsaInfo(0, routes, function (routes) {
          renderResponse(routes);
        })
      } else {
        renderResponse(routes);
      }
    } else {
      res.status(404).send();
    }
  });
};


function resolveUpsaInfo(index, routes, cb) {
  driverDB.byId(routes[index].routeId.toString(), function (err, route) {
    social.getUserByEmail(route.username, function (userInfo) {
      routes[index].upsaInfo = userInfo;
      if (++index < routes.length) {
        resolveUpsaInfo(index, routes, cb);
      } else {
        cb.call(null, routes);
      }
    })
  });
}

exports.acceptDriver = function (req, res) {
  var routeId = req.params.routeId;
  var companionId = req.params.companionId;
  companionDB.acceptDriver(routeId, companionId, function (err) {
    res.send({
      status: "ok",
      routeUrl: req.protocol + "://" + req.headers.host + "/driver/route/" + routeId
    })
  });
};