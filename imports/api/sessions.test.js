/* eslint-env mocha */

import { Meteor } from "meteor/meteor";

import { Random } from "meteor/random";

import { MovieSessions } from "./sessions.js";

import { assert } from "chai";

import moment from "moment";

if (Meteor.isServer) {
  describe("sessions", () => {
    describe("methods", () => {
      const userIdMe = Random.id();
      const userIdOther = Random.id();
      const nextSchedule = new Meteor.Collection.ObjectID();
      const nextSchedule2 = new Meteor.Collection.ObjectID();
      const prevSchedule = new Meteor.Collection.ObjectID();
      const seatRowFree = 5;
      const seatColFree = 3;
      const seatRowTaken = 5;
      const seatColTaken = 4;

      beforeEach(() => {
        const defaultMovieId = new Meteor.Collection.ObjectID();

        Meteor.users.remove({});
        Meteor.users.insert({
          _id: userIdMe,
          username: "test"
        });

        MovieSessions.remove({});
        MovieSessions.insert({
          _id: nextSchedule,
          movieId: defaultMovieId,
          showTime: moment()
            .add(10, "minutes")
            .toDate(),
          reservations: [
            {
              row: seatRowTaken,
              col: seatColTaken,
              userId: userIdOther
            }
          ]
        });

        MovieSessions.insert({
          _id: nextSchedule2,
          movieId: defaultMovieId,
          showTime: moment()
            .add(20, "minutes")
            .toDate(),
          reservations: [
            {
              row: seatRowTaken,
              col: seatColTaken,
              userId: userIdOther
            }
          ]
        });

        MovieSessions.insert({
          _id: prevSchedule,
          movieId: defaultMovieId,
          showTime: moment()
            .add(-10, "minutes")
            .toDate(),
          reservations: [
            {
              row: seatRowTaken,
              col: seatColTaken,
              userId: userIdOther
            }
          ]
        });
      });

      it("unregistered users cannot book a seat", () => {
        const bookTask = Meteor.server.method_handlers["sessions.book"];
        const invocation = { userId: null };

        assert.throws(
          () => {
            bookTask.apply(invocation, [
              nextSchedule,
              seatRowFree,
              seatColFree
            ]);
          },
          Meteor.Error,
          /not-authorized/
        );

        assert.equal(
          MovieSessions.find({
            _id: nextSchedule,
            reservations: {
              $elemMatch: {
                row: seatRowFree,
                col: seatColFree
              }
            }
          }).count(),
          0
        );
      });

      it("unregistered users cannot unbook a seat", () => {
        const unbookTask = Meteor.server.method_handlers["sessions.unbook"];
        const invocation = { userId: null };

        assert.throws(
          () => {
            unbookTask.apply(invocation, [
              nextSchedule,
              seatRowTaken,
              seatRowTaken
            ]);
          },
          Meteor.Error,
          /not-authorized/
        );

        assert.equal(
          MovieSessions.find({
            _id: nextSchedule,
            reservations: {
              $elemMatch: {
                row: seatRowTaken,
                col: seatColTaken
              }
            }
          }).count(),
          1
        );
      });

      it("registered user can book a free seat", () => {
        const bookTask = Meteor.server.method_handlers["sessions.book"];
        const invocation = { userId: userIdMe };
        bookTask.apply(invocation, [nextSchedule, seatRowFree, seatColFree]);

        assert.equal(
          MovieSessions.find({
            _id: nextSchedule,
            reservations: {
              $elemMatch: {
                row: seatRowFree,
                col: seatColFree,
                userId: userIdMe
              }
            }
          }).count(),
          1
        );
      });

      it("registered user cannot book a taken seat", () => {
        const bookTask = Meteor.server.method_handlers["sessions.book"];
        const invocation = { userId: userIdMe };
        bookTask.apply(invocation, [nextSchedule, seatRowTaken, seatColTaken]);

        assert.equal(
          MovieSessions.find({
            _id: nextSchedule,
            reservations: {
              $elemMatch: {
                row: seatRowTaken,
                col: seatColTaken,
                userId: userIdMe
              }
            }
          }).count(),
          0
        );
      });

      it("registered user can unbook own seat", () => {
        const unbookTask = Meteor.server.method_handlers["sessions.unbook"];
        const invocation = { userId: userIdOther };
        unbookTask.apply(invocation, [
          nextSchedule,
          seatRowTaken,
          seatColTaken
        ]);

        assert.equal(
          MovieSessions.find({
            _id: nextSchedule,
            reservations: {
              $elemMatch: {
                row: seatRowTaken,
                col: seatColTaken
              }
            }
          }).count(),
          0
        );
      });

      it("registered users cannot book a seat on expired show", () => {
        const bookTask = Meteor.server.method_handlers["sessions.book"];
        const invocation = { userId: userIdMe };
        bookTask.apply(invocation, [prevSchedule, seatRowFree, seatColFree]);

        assert.equal(
          MovieSessions.find({
            _id: prevSchedule,
            reservations: {
              $elemMatch: {
                row: seatRowFree,
                col: seatColFree
              }
            }
          }).count(),
          0
        );
      });

      it("registered users cannot unbook a seat on expired show", () => {
        const unbookTask = Meteor.server.method_handlers["sessions.unbook"];
        const invocation = { userId: userIdOther };
        unbookTask.apply(invocation, [
          prevSchedule,
          seatRowTaken,
          seatColTaken
        ]);

        assert.equal(
          MovieSessions.find({
            _id: prevSchedule,
            reservations: {
              $elemMatch: {
                row: seatRowTaken,
                col: seatColTaken,
                userId: userIdOther
              }
            }
          }).count(),
          1
        );
      });
    });
  });
}
