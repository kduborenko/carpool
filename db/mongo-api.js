var mongo = require('mongodb').MongoClient;
var dbSettings = require('./settings');

exports.save = function (coll, obj, cb) {
  mongo.connect(dbSettings.url, function (err, db) {
    if (err) {
      cb.call(null, err, null);
      return;
    }
    db.collection(coll).save(obj, function (err, doc) {
      cb.call(null, err, doc);
      db.close();
    });
  });
};

