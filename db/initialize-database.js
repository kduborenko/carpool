var carpoolDB = db.getSisterDB("carpool");

carpoolDB.companions.ensureIndex({"points.loc": "2d", "points.type": 1});