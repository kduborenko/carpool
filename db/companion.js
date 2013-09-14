var mongo = require('mongodb').MongoClient;
var dbSettings = require('./settings');

exports.pickMe = function (username, from, to, cb) {
  console.log("test");
  console.log(dbSettings);

  mongo.connect(dbSettings.url, function (err, db) {
    if (err) throw err;

    var collection = db.collection('companions');
    collection.save({
      username: username,
      points: [
        {
          type: "from",
          loc: [from.lat, from. lon]
        },
        {
          type: "to",
          loc: [to.lat, to.lon]
        }
      ]
    }, function (err, doc) {
      // Locate all the entries using find
      console.log(doc);
      db.close();
      cb.call(null, err, doc);
    });
  })
};