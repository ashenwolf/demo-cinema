import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import moment from "moment";

import { Meteor } from "meteor/meteor";
import { EJSON } from "meteor/ejson";

import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

import styles from "../config/styles.js";

class Sessions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTime: moment()
    };
  }

  changeShowTime(event) {
    const tm = moment(event.target.value, "HH:mm");
    this.setState({ showTime: tm.isValid() ? tm : moment() });
  }

  addShowTime(event) {
    event.preventDefault();

    Meteor.call(
      "sessions.add",
      this.props.movieId,
      this.state.showTime.toDate()
    );
  }

  renderSchedule() {
    const { classes } = this.props;
    var { schedule } = this.props;

    return schedule
      ? schedule
        .sort((tm1, tm2) => tm1.showTime > tm2.showTime)
        .map(tm => {
          return (
            <Button
              key={tm._id}
              variant={
                EJSON.equals(tm._id, this.props.selectedSessionId) &&
                  tm.showTime > this.props.currentTime
                  ? "contained"
                  : "outlined"
              }
              disabled={tm.showTime <= this.props.currentTime}
              color="primary"
              className={classNames(classes.button, classes.block)}
              onClick={this.props.onShowSelected.bind(null, tm._id)}
            >
              <span>{moment(tm.showTime).format("YYYY-MM-DD HH:mm")}</span>
            </Button>
          );
        })
      : "";
  }

  renderNewShow() {
    const { classes, movieId } = this.props;

    return Meteor.userId() && movieId ? (
      <form
        className={classes.container}
        noValidate
        onSubmit={this.addShowTime.bind(this)}
      >
        <TextField
          id="time"
          label="Add New Show Time"
          type="time"
          value={this.state.showTime.format("HH:mm")}
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
          disabled={this.state.showTime.isBefore(this.props.currentTime)}
          className={classNames(classes.button, classes.block)}
        >
          Add Show Time
        </Button>
      </form>
    ) : (
      ""
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.renderSchedule()}
        {this.renderNewShow()}
      </React.Fragment>
    );
  }
}

Sessions.propTypes = {
  classes: PropTypes.object.isRequired,
  onShowSelected: PropTypes.func.isRequired,

  schedule: PropTypes.array,
  movieId: PropTypes.object,
  selectedSessionId: PropTypes.object,
  currentTime: PropTypes.number
};

export default withStyles(styles)(Sessions);
