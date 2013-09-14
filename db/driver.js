var mongo = require('./mongo-api');

exports.registerRoute = function (username, route, cb) {
  mongo.save(
    "driver_routes",
    {
      username: username,
      route: route
    },
    function (err, doc) {
      cb.call(null, err, doc);
    })
};