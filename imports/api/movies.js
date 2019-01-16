import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

export const Movies = new Mongo.Collection("movies");

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("movies", function moviesPublication() {
    return Movies.find();
  });
}

Meteor.methods({
  "movies.reset"() {
    Movies.remove({});
    Movies.insert({
      _id: new Meteor.Collection.ObjectID(),
      title: "Lord of the Rings",
      year: 2002,
      picture:
        "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg",
      schedule: []
    });
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
  },

  "movies.book"(movieId, scheduleId, row, col) {
    check(movieId, Meteor.Collection.ObjectID);
    check(scheduleId, Meteor.Collection.ObjectID);

    // Make sure the user is logged in before inserting a task
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    Movies.update(
      {
        _id: movieId,
        "schedule._id": scheduleId
      },
      {
        $push: {
          "schedule.$.reservations": {
            row,
            col,
            userId: this.userId,
            username: Meteor.users.findOne(this.userId).username,
            createdAt: new Date()
          }
        }
      }
    );
  },
  "movies.unbook"(movieId, scheduleId, row, col) {
    check(movieId, Meteor.Collection.ObjectID);
    check(scheduleId, Meteor.Collection.ObjectID);

    // Make sure the user is logged in before inserting a task
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    Movies.update(
      { _id: movieId, "schedule._id": scheduleId },
      {
        $pull: {
          "schedule.$.reservations": {
            row,
            col,
            userId: this.userId
          }
        }
      }
    );
  }
});
