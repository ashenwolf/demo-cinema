import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

export const MovieSessions = new Mongo.Collection("movie-sessions");

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("movie-sessions", function movieSessionsPublication(movieId) {
    return MovieSessions.find({ movieId: movieId }, { sort: { showTime: 1 } });
  });
}

Meteor.methods({
  "sessions.book"(sessionId, row, col) {
    check(sessionId, Meteor.Collection.ObjectID);
    check(row, Number);
    check(col, Number);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    const result = MovieSessions.update(
      { _id: sessionId, reservations: { $elemMatch: { row: row, col: col } } },
      { $set: { "reservations.$.row": row, "reservations.$.col": col } }
    );

    if (!result) {
      MovieSessions.update(
        {
          _id: sessionId,
          showTime: { $gte: new Date() }
        },
        {
          $push: {
            reservations: {
              row,
              col,
              userId: this.userId,
              username: Meteor.users.findOne(this.userId).username,
              createdAt: new Date()
            }
          }
        }
      );
    }
  },

  "sessions.unbook"(sessionId, row, col) {
    check(sessionId, Meteor.Collection.ObjectID);
    check(row, Number);
    check(col, Number);

    // Make sure the user is logged in before inserting a task
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    MovieSessions.update(
      {
        _id: sessionId,
        showTime: { $gte: new Date() }
      },
      {
        $pull: {
          reservations: { row, col, userId: this.userId }
        }
      }
    );
  },

  "sessions.add"(movieId, tm) {
    check(movieId, Meteor.Collection.ObjectID);
    check(tm, Date);

    MovieSessions.insert({
      _id: new Meteor.Collection.ObjectID(),
      movieId: movieId,
      showTime: tm,
      reservations: []
    });
  },

  "sessions.reset"() {
    MovieSessions.remove({});
  }
});
