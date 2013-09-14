var companionDB = require('../db/companion');

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
    if (companion) {
      res.send({
        companionId: companion._id,
        username: companion.username,
        from: {
          lat: companion.from[1],
          lon: companion.from[0]
        },
        to: {
          lat: companion.to[1],
          lon: companion.to[0]
        },
        routesProposals: companion.routes_proposals ?
          companion.routes_proposals.map(function (proposal) {
            return {
              routeId: proposal,
              routeUrl: req.protocol + "://" + req.headers.host
                          + "/driver/route/" + proposal
            }
          }) :
          null
      });
    } else {
      res.status(404).send();
    }
  });
};