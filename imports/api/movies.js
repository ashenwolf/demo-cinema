import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { MongoInternals } from "meteor/mongo";
import { check } from "meteor/check";

export const Movies = new Mongo.Collection("movies");

export const ResetMoviesDb = () => {
  Movies.remove({});
  return Movies.insert({
    _id: new Meteor.Collection.ObjectID(),
    title: "Lord of the Rings",
    year: 2002,
    picture:
      "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg",
    schedule: []
  });
};

const toNativeObjectId = id => MongoInternals.NpmModule.ObjectID(id._str);

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("movies", function moviesPublication() {
    return Movies.find();
  });
}

Meteor.methods({
  "movies.book"(movieId, scheduleId, row, col) {
    check(movieId, Meteor.Collection.ObjectID);
    check(scheduleId, Meteor.Collection.ObjectID);
    check(row, Number);
    check(col, Number);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if (Meteor.isServer) {
      const collection = Movies.rawCollection();
      // check if element exists to avoid double booking
      const result = Meteor.wrapAsync(collection.findOne, collection)({
        _id: toNativeObjectId(movieId),
        schedule: {
          $elemMatch: {
            _id: toNativeObjectId(scheduleId),
            reservations: {
              $elemMatch: {
                row: row,
                col: col
              }
            }
          }
        }
      });

      if (!result) {
        Meteor.wrapAsync(collection.update, collection)(
          { _id: toNativeObjectId(movieId) },
          {
            $push: {
              "schedule.$[item].reservations": {
                row,
                col,
                userId: this.userId,
                username: Meteor.users.findOne(this.userId).username,
                createdAt: new Date()
              }
            }
          },
          {
            arrayFilters: [
              {
                "item._id": toNativeObjectId(scheduleId),
                "item.showTime": { $gte: new Date() }
              }
            ]
          }
        );
      }
    }
  },

  "movies.unbook"(movieId, scheduleId, row, col) {
    check(movieId, Meteor.Collection.ObjectID);
    check(scheduleId, Meteor.Collection.ObjectID);
    check(row, Number);
    check(col, Number);

    // Make sure the user is logged in before inserting a task
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if (Meteor.isServer) {
      const collection = Movies.rawCollection();
      // check if element exists to avoid double booking
      Meteor.wrapAsync(collection.update, collection)(
        {
          _id: toNativeObjectId(movieId)
          //"schedule._id": toNativeObjectId(scheduleId)
        },
        {
          $pull: {
            "schedule.$[item].reservations": { row, col, userId: this.userId }
          }
        },
        {
          arrayFilters: [
            {
              "item._id": toNativeObjectId(scheduleId),
              "item.showTime": { $gte: new Date() }
            }
          ]
        }
      );
    }
  },

  "movies.reset"() {
    ResetMoviesDb();
  },

  "movies.addShow"(movieId, tm) {
    check(movieId, Meteor.Collection.ObjectID);
    check(tm, Date);

    Movies.update(
      { _id: movieId },
      {
        $push: {
          schedule: {
            $each: [
              {
                _id: new Meteor.Collection.ObjectID(),
                showTime: tm,
                reservations: []
              }
            ],
            $sort: { showTime: 1 }
          }
        }
      }
    );
  }
});
