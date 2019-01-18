import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { EJSON } from "meteor/ejson";

import PropTypes from "prop-types";

import withStyles from "@material-ui/core/styles/withStyles";
import CssBaseline from "@material-ui/core/CssBaseline";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import compose from "recompose/compose";
import classNames from "classnames";

import { Movies } from "../api/movies.js";

import AccountsUIWrapper from "./AccountsUIWrapper.js";
import Sessions from "./Sessions.js";
import Show from "./Show.js";

import styles from "../config/styles.js";

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedScheduleId: null,
      currentTime: Date.now()
    };
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState({ currentTime: Date.now() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  activeMovie() {
    return this.props.movie;
  }

  activeSchedule() {
    const movie = this.activeMovie();
    return movie ? movie.schedule : null;
  }

  activeShow() {
    const movie = this.activeMovie();
    return movie && this.state.selectedScheduleId
      ? movie.schedule.find(el =>
        EJSON.equals(el._id, this.state.selectedScheduleId)
      )
      : null;
  }

  resetDb() {
    this.setState({ selectedScheduleId: null });
    Meteor.call("movies.reset");
  }

  toggleSelectedScheduleId(id) {
    this.setState({
      selectedScheduleId: id === this.state.selectedScheduleId ? null : id
    });
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="absolute" color="default" className={classes.appBar}>
          <Toolbar>
            <Typography
              variant="h6"
              color="inherit"
              noWrap
              className={classNames(classes.grow)}
            >
              Grammarly Cinema
            </Typography>
            <AccountsUIWrapper />
          </Toolbar>
        </AppBar>
        <main className={classes.layout}>
          <Paper className={classes.paper}>
            <Typography component="h2" variant="h4" align="center">
              Select Seats{" "}
            </Typography>
            <hr />
            <Grid container spacing={8}>
              <Grid item xs={12} md={4}>
                <Sessions
                  currentTime={this.state.currentTime}
                  movieId={this.props.movie ? this.props.movie._id : null}
                  selectedScheduleId={this.state.selectedScheduleId}
                  schedule={this.activeSchedule()}
                  onShowSelected={this.toggleSelectedScheduleId.bind(this)}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Show
                  currentTime={this.state.currentTime}
                  movieId={this.props.movie ? this.props.movie._id : null}
                  show={this.activeShow()}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  className={classNames(classes.button, classes.block)}
                  onClick={this.resetDb.bind(this)}
                >
                  Reset ShowTime Database
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </main>
      </React.Fragment>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  movie: PropTypes.object
};

export default compose(
  withStyles(styles),
  withTracker(() => {
    Meteor.subscribe("movies");

    return {
      movie: Movies.findOne({}),
      currentUser: Meteor.user()
    };
  })
)(App);
