import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";

import { Meteor } from "meteor/meteor";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";

import classnames from "classnames";

const styles = () => ({
  seat: {
    minWidth: 16,
    minHeight: 24,
    margin: 2,
    //padding: 5,
    paddingLeft: 8,
    paddingRight: 8,
    border: "1px solid #3f51b5"
  },
  disabled: {
    pointerEvents: "none",
    border: "1px solid #eee"
  }
});

class Seat extends Component {
  reservationColor() {
    if (!this.props.reservation) return "primary";
    switch (this.props.reservation.userId) {
    case null:
      return "primary";
    case Meteor.userId():
      return "primary";
    default:
      return "secondary";
    }
  }

  bookSeat() {
    if (
      this.props.reservation &&
      this.props.reservation.userId === Meteor.userId()
    ) {
      Meteor.call(
        "movies.unbook",
        this.props.movieId,
        this.props.scheduleId,
        this.props.row,
        this.props.col
      );
    } else if (!this.props.reservation) {
      Meteor.call(
        "movies.book",
        this.props.movieId,
        this.props.scheduleId,
        this.props.row,
        this.props.col
      );
    }
  }

  render() {
    // const taskClassName = classnames({
    //   checked: this.props.task.checked,
    //   private: this.props.task.private
    // });
    const { classes } = this.props;

    return (
      <Tooltip
        title={this.props.reservation ? this.props.reservation.username : ""}
        placement="top-start"
      >
        <Button
          variant={
            this.props.reservation && this.props.reservation.userId
              ? "contained"
              : "outlined"
          }
          color={this.reservationColor()}
          className={classnames(
            classes.seat,
            this.props.disabled ? classes.disabled : {}
          )}
          onClick={this.bookSeat.bind(this)}
        >
          {this.props.children}
        </Button>
      </Tooltip>
    );
  }
}

Seat.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.any,
  row: PropTypes.any,
  col: PropTypes.any,
  movieId: PropTypes.object,
  scheduleId: PropTypes.object,
  reservation: PropTypes.object,
  disabled: PropTypes.bool
};

export default withStyles(styles)(Seat);
