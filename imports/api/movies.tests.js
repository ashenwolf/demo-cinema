/* eslint-env mocha */

import { Meteor } from "meteor/meteor";

import { Random } from "meteor/random";

import { Movies, ResetMoviesDb } from "./movies.js";

import { assert } from "chai";

import moment from "moment";

if (Meteor.isServer) {
  describe("Movies", () => {
    describe("methods", () => {
      const userIdMe = Random.id();
      const userIdOther = Random.id();
      const nextSchedule = new Meteor.Collection.ObjectID();
      const prevSchedule = new Meteor.Collection.ObjectID();
      const seatRowFree = 5;
      const seatColFree = 3;
      const seatRowTaken = 5;
      const seatColTaken = 4;
      var defaultMovieId;

      beforeEach(() => {
        defaultMovieId = ResetMoviesDb();

        Meteor.users.remove({});
        Meteor.users.insert({
          _id: userIdMe,
          username: "test"
        });

        Movies.update(
          { _id: defaultMovieId },
          {
            $push: {
              schedule: {
                $each: [
                  {
                    _id: nextSchedule,
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
                  },
                  {
                    _id: prevSchedule,
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
                  }
                ],
                $sort: { showTime: 1 }
              }
            }
          }
        );
      });

      it("unregistered users cannot book a seat", () => {
        const bookTask = Meteor.server.method_handlers["movies.book"];
        const invocation = { userId: null };

        assert.throws(
          () => {
            bookTask.apply(invocation, [
              defaultMovieId,
              nextSchedule,
              seatRowFree,
              seatColFree
            ]);
          },
          Meteor.Error,
          /not-authorized/
        );

        assert.equal(
          Movies.find({
            _id: defaultMovieId,
            schedule: {
              $elemMatch: {
                _id: nextSchedule,
                reservations: {
                  $elemMatch: {
                    row: seatRowFree,
                    col: seatColFree
                  }
                }
              }
            }
          }).count(),
          0
        );
      });

      it("unregistered users cannot unbook a seat", () => {
        const unbookTask = Meteor.server.method_handlers["movies.unbook"];
        const invocation = { userId: null };

        assert.throws(
          () => {
            unbookTask.apply(invocation, [
              defaultMovieId,
              nextSchedule,
              seatRowTaken,
              seatRowTaken
            ]);
          },
          Meteor.Error,
          /not-authorized/
        );

        assert.equal(
          Movies.find({
            _id: defaultMovieId,
            schedule: {
              $elemMatch: {
                _id: nextSchedule,
                reservations: {
                  $elemMatch: {
                    row: seatRowTaken,
                    col: seatColTaken
                  }
                }
              }
            }
          }).count(),
          1
        );
      });

      it("registered user can book a free seat", () => {
        const bookTask = Meteor.server.method_handlers["movies.book"];
        const invocation = { userId: userIdMe };
        bookTask.apply(invocation, [
          defaultMovieId,
          nextSchedule,
          seatRowFree,
          seatColFree
        ]);

        assert.equal(
          Movies.find({
            _id: defaultMovieId,
            schedule: {
              $elemMatch: {
                _id: nextSchedule,
                reservations: {
                  $elemMatch: {
                    row: seatRowFree,
                    col: seatColFree,
                    userId: userIdMe
                  }
                }
              }
            }
          }).count(),
          1
        );
      });

      it("registered user cannot book a taken seat", () => {
        const bookTask = Meteor.server.method_handlers["movies.book"];
        const invocation = { userId: userIdMe };
        bookTask.apply(invocation, [
          defaultMovieId,
          nextSchedule,
          seatRowTaken,
          seatColTaken
        ]);

        assert.equal(
          Movies.find({
            _id: defaultMovieId,
            schedule: {
              $elemMatch: {
                _id: nextSchedule,
                reservations: {
                  $elemMatch: {
                    row: seatRowTaken,
                    col: seatColTaken,
                    userId: userIdMe
                  }
                }
              }
            }
          }).count(),
          0
        );
      });

      it("registered user can unbook own seat", () => {
        const unbookTask = Meteor.server.method_handlers["movies.unbook"];
        const invocation = { userId: userIdOther };
        unbookTask.apply(invocation, [
          defaultMovieId,
          nextSchedule,
          seatRowTaken,
          seatColTaken
        ]);

        assert.equal(
          Movies.find({
            _id: defaultMovieId,
            schedule: {
              $elemMatch: {
                _id: nextSchedule,
                reservations: {
                  $elemMatch: {
                    row: seatRowTaken,
                    col: seatColTaken
                  }
                }
              }
            }
          }).count(),
          0
        );
      });

      it("registered users cannot book a seat on expired show", () => {
        const bookTask = Meteor.server.method_handlers["movies.book"];
        const invocation = { userId: userIdMe };
        bookTask.apply(invocation, [
          defaultMovieId,
          prevSchedule,
          seatRowFree,
          seatColFree
        ]);

        assert.equal(
          Movies.find({
            _id: defaultMovieId,
            schedule: {
              $elemMatch: {
                _id: prevSchedule,
                reservations: {
                  $elemMatch: {
                    row: seatRowFree,
                    col: seatColFree
                  }
                }
              }
            }
          }).count(),
          0
        );
      });

      it("registered users cannot unbook a seat on expired show", () => {
        const unbookTask = Meteor.server.method_handlers["movies.unbook"];
        const invocation = { userId: userIdOther };
        unbookTask.apply(invocation, [
          defaultMovieId,
          prevSchedule,
          seatRowTaken,
          seatColTaken
        ]);

        assert.equal(
          Movies.find({
            _id: defaultMovieId,
            schedule: {
              $elemMatch: {
                _id: prevSchedule,
                reservations: {
                  $elemMatch: {
                    row: seatRowTaken,
                    col: seatColTaken,
                    userId: userIdOther
                  }
                }
              }
            }
          }).count(),
          1
        );
      });
    });
  });
}
