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
      mongo.find(
        "companions",
        {}, // todo select based on location
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