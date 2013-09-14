var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var dbSettings = require('./settings');

exports.types = {
  ObjectID: mongodb.ObjectID
};

exports.save = function (coll, obj, cb) {
  mongoClient.connect(dbSettings.url, function (err, db) {
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

exports.find = function (coll, query, cb) {
  mongoClient.connect(dbSettings.url, function (err, db) {
    if (err) {
      cb.call(null, err, null);
      return;
    }
    db.collection(coll).find(query).toArray(function (err, docs) {
      cb.call(null, err, docs);
      db.close();
    });
  });
};

exports.findOne = function (coll, query, cb) {
  mongoClient.connect(dbSettings.url, function (err, db) {
    if (err) {
      cb.call(null, err, null);
      return;
    }
    db.collection(coll).findOne(query, function (err, doc) {
      cb.call(null, err, doc);
      db.close();
    });
  });
};

exports.update = function (coll, query, request, cb) {
  mongoClient.connect(dbSettings.url, function (err, db) {
    if (err) {
      cb.call(null, err, null);
      return;
    }
    db.collection(coll).update(query, request, function (err) {
      cb.call(null, err);
      db.close();
    });
  });
};

