import React, { Component } from "react";
//import ReactDOM from "react-dom";
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
import TextField from "@material-ui/core/TextField";

import compose from "recompose/compose";
import classNames from "classnames";
import moment from "moment";

import { Movies } from "../api/movies.js";

import AccountsUIWrapper from "./AccountsUIWrapper.js";
import SeatMap from "./SeatMap.js";

const styles = theme => ({
  appBar: {
    position: "relative"
  },
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "100%"
  },
  grow: {
    flexGrow: 1
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 2 * 2)]: {
      width: 600,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
      padding: theme.spacing.unit * 3
    }
  },
  block: {
    width: "100%"
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end"
  },
  button: {
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 1
    //marginLeft: theme.spacing.unit
  },
  centerText: {
    textAlign: "center"
  }
});

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedScheduleId: null,
      showTime: moment(),
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

  changeShowTime(event) {
    const tm = moment(event.target.value, "HH:mm");
    this.setState({ showTime: tm.isValid() ? tm : moment() });
  }

  addShowTime(event) {
    event.preventDefault();

    Meteor.call(
      "movies.addShow",
      this.props.movies[0]._id,
      this.state.showTime.toDate()
    );
  }

  resetDb() {
    Meteor.call("movies.reset");
  }

  toggleSelectedScheduleId(id) {
    this.setState({
      selectedScheduleId: id === this.state.selectedScheduleId ? null : id
    });
  }

  selectedSchedule() {
    if (!this.state.selectedScheduleId) return null;

    const schd = this.props.movies[0].schedule.find(el =>
      EJSON.equals(el._id, this.state.selectedScheduleId)
    );

    return schd;
  }

  renderDiffTime() {
    if (!this.state.selectedScheduleId) return "";

    const seconds = moment(this.selectedSchedule().showTime).diff(
      moment(this.state.currentTime),
      "seconds"
    );

    if (seconds <= 0) return "Show Started";

    const hh = Math.floor(seconds / 60 / 60);
    const mm = Math.floor(seconds / 60) % 60;
    const ss = seconds % 60;
    return (
      <span>
        {hh.toString().padStart(2, "0")}:{mm.toString().padStart(2, "0")}:
        {ss.toString().padStart(2, "0")} till the show starts
      </span>
    );
  }

  renderSchedule() {
    const { classes } = this.props;

    return this.props.movies.length > 0
      ? this.props.movies[0].schedule
        .sort((tm1, tm2) => tm1.showTime > tm2.showTime)
        .map(tm => {
          return (
            <Button
              key={tm._id}
              variant={
                EJSON.equals(tm._id, this.state.selectedScheduleId) &&
                  tm.showTime > this.state.currentTime
                  ? "contained"
                  : "outlined"
              }
              disabled={tm.showTime <= this.state.currentTime}
              color="primary"
              className={classNames(classes.button, classes.block)}
              onClick={this.toggleSelectedScheduleId.bind(this, tm._id)}
            >
              <span>{moment(tm.showTime).format("YYYY-MM-DD HH:mm")}</span>
            </Button>
          );
        })
      : [];
  }

  render() {
    const { classes } = this.props;
    //const { activeStep } = this.state;

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
              Select Seats
            </Typography>
            <hr />
            <Grid container spacing={8}>
              <Grid item xs={12} md={4} />
              <Grid item xs={12} md={8}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classNames(classes.button, classes.block)}
                  disabled
                >
                  <div>
                    {(() => {
                      return this.state.selectedScheduleId
                        ? this.renderDiffTime()
                        : "Select Timeslot";
                    })()}
                  </div>
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                {this.renderSchedule()}
                <hr />
                <form
                  className={classes.container}
                  noValidate
                  onSubmit={this.addShowTime.bind(this)}
                >
                  <TextField
                    id="time"
                    label="Add New Show Time"
                    type="time"
                    value={
                      this.state.showTime.format("HH:mm") //defaultValue="0:30"
                    }
                    onChange={this.changeShowTime.bind(this)}
                    className={classes.textField}
                    InputLabelProps={{ shrink: true }}
                    inputProps={
                      { step: 300 } // 5 min
                    }
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={this.state.showTime.isBefore(
                      this.state.currentTime
                    )}
                    className={classNames(classes.button, classes.block)}
                  >
                    Add Show Time
                  </Button>
                </form>
              </Grid>
              <Grid item xs={12} md={8}>
                {(() => {
                  return this.selectedSchedule() ? (
                    <SeatMap
                      disabled={
                        this.selectedSchedule().showTime <=
                        this.state.currentTime
                      }
                      movieId={this.props.movies[0]._id}
                      scheduleId={this.state.selectedScheduleId}
                      rows={6}
                      cols={8}
                      className={classes.centerText}
                      reservations={this.selectedSchedule().reservations}
                    />
                  ) : (
                    ""
                  );
                })()}
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
  movies: PropTypes.array
};

export default compose(
  withStyles(styles),
  withTracker(() => {
    Meteor.subscribe("movies");

    return {
      //tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
      movies: Movies.find({}).fetch(), //incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
      currentUser: Meteor.user()
    };
  })
)(App);
