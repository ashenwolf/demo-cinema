import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

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
    return Movies.insert({
      _id: new Meteor.Collection.ObjectID(),
      title: "Lord of the Rings",
      year: 2002,
      picture:
        "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg"
    });
  }
});
