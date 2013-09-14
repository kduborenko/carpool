var mongo = require('./mongo-api');

exports.pickMe = function (username, from, to, cb) {
  mongo.save('companions', {
      username: username,
      points: [
        {
          type: "from",
          loc: [from.lat, from.lon]
        },
        {
          type: "to",
          loc: [to.lat, to.lon]
        }
      ]
    },
    function (err, doc) {
      cb.call(null, err, doc);
    });
};