var mongo = require('./mongo-api');

exports.registerRoute = function (username, route, cb) {
  mongo.save(
    "driver_routes",
    {
      username: username,
      route: route
    },
    function (err, route) {
      if (err) {
        cb.call(null, err);
        return;
      }
      var to = route.route[route.route.length - 1];
      var from = route.route[0];
      var searchRadius = 1.1 * Math.sqrt(Math.pow(to.lat - from.lat, 2) + Math.pow(to.lon - from.lon, 2)) * Math.PI / 180;
      mongo.find(
        "companions",
        {
          to: {
            $geoWithin: {
              $centerSphere: [
                [to.lon, to.lat],
                0.5 / 6371 // radius = 500m
              ]
            }
          },
          from: {
            $geoWithin: {
              $centerSphere: [
                [(to.lon + from.lon) / 2, (to.lat + from.lat) / 2],
                searchRadius
              ]
            }
          }
        },
        function (err, companions) {
          cb.call(null, err, route, companions);
        });
    })
};

exports.pickPassenger = function (routeId, companionId, cb) {
  mongo.update(
    "companions",
    {
      _id: new mongo.types.ObjectID(companionId)
    },
    {
      $addToSet: {
        routes_proposals: new mongo.types.ObjectID(routeId)
      }
    },
    function (err) {
      cb.call(null, err);
    }
  )
};

exports.byId = function (routeId, cb) {
  mongo.findOne('driver_routes', {
      _id: new mongo.types.ObjectID(routeId)
    },
    function (err, doc) {
      cb.call(null, err, doc);
    });
};