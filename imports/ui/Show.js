import React, { Component } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import moment from "moment";

import withStyles from "@material-ui/core/styles/withStyles";
import Button from "@material-ui/core/Button";

import SeatMap from "./SeatMap.js";

import styles from "../config/styles.js";
import uiConfig from "../config/ui.js";

class Show extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTime: moment()
    };
  }

  renderDiffTime() {
    if (!this.props.show) return "";

    const seconds = moment(this.props.show.showTime).diff(
      moment(this.props.currentTime),
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

  renderSeatMap() {
    const { classes, show } = this.props;

    return show ? (
      <SeatMap
        disabled={moment(show.showTime).isBefore(this.state.currentTime)}
        movieId={this.props.movieId}
        showId={show._id}
        rows={uiConfig.seats.rows}
        cols={uiConfig.seats.cols}
        className={classes.centerText}
        reservations={show.reservations}
      />
    ) : (
      ""
    );
  }

  render() {
    const { classes, show } = this.props;

    return (
      <React.Fragment>
        <Button
          variant="contained"
          color="primary"
          className={classNames(classes.button, classes.block)}
          disabled
        >
          {(() => {
            return show ? this.renderDiffTime() : "Select Timeslot";
          })()}
        </Button>
        {this.renderSeatMap()}
      </React.Fragment>
    );
  }
}

Show.propTypes = {
  classes: PropTypes.object.isRequired,

  show: PropTypes.object,
  movieId: PropTypes.object,
  currentTime: PropTypes.number
};

export default withStyles(styles)(Show);
