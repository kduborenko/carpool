var carpoolDB = db.getSisterDB("carpool");

carpoolDB.companions.ensureIndex({"to": "2d"});