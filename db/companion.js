var mongo = require('./mongo-api');

exports.pickMe = function (username, from, to, cb) {
  mongo.save('companions', {
      username: username,
      from: [from.lon, from.lat],
      to: [to.lon, to.lat],
      lookingForDriver: true
    },
    function (err, doc) {
      cb.call(null, err, doc);
    });
};

exports.byId = function (companionId, cb) {
  mongo.findOne('companions', {
      _id: new mongo.types.ObjectID(companionId)
    },
    function (err, doc) {
      cb.call(null, err, doc);
    });
};

exports.acceptDriver = function (routeId, companionId, cb) {
  mongo.update(
    'driver_routes',
    {
      _id: new mongo.types.ObjectID(routeId)
    },
    {
      $addToSet: {
        companions: new mongo.types.ObjectID(companionId)
      }
    },
    function (err, doc) {
      if (err) {
        cb.call(null, err);
        return;
      }
      mongo.update(
        'companions',
        {
          _id: new mongo.types.ObjectID(companionId)
        },
        {
          $unset: {
            lookingForDriver: 1
          }
        },
        function (err, doc) {
          cb.call(null, err);
        });
    });
};