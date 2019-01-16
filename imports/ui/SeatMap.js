import React, { Component } from "react";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
//import { Meteor } from "meteor/meteor";

//import classnames from "classnames";

import Seat from "./Seat.js";

const styles = () => ({
  cinemaRow: {
    textAlign: "center"
  },
  seatRow: {
    padding: 5,
    paddingLeft: 8,
    paddingRight: 8
  }
});

class SeatMap extends Component {
  getReservedBy(r, c) {
    return this.props.reservations.find(el => el.row === r && el.col === c);
  }

  render() {
    // const taskClassName = classnames({
    //   checked: this.props.task.checked,
    //   private: this.props.task.private
    // });
    const { classes } = this.props;

    const range = n => Array.from({ length: n }, (value, key) => key);

    return range(this.props.rows).map(r => {
      return (
        <div key={r} className={classes.cinemaRow}>
          <span className={classes.seatRow}>{r + 1}</span>
          {range(this.props.cols).map(c => {
            return (
              <Seat
                key={c}
                row={r}
                col={c}
                disabled={this.props.disabled}
                movieId={this.props.movieId}
                scheduleId={this.props.scheduleId}
                reservation={this.getReservedBy(r, c)}
              >
                {c + 1}
              </Seat>
            );
          })}
          <span className={classes.seatRow}>{r + 1}</span>
        </div>
      );
    });
  }
}

SeatMap.propTypes = {
  classes: PropTypes.object.isRequired,
  movieId: PropTypes.object,
  scheduleId: PropTypes.object,
  reservations: PropTypes.array,
  rows: PropTypes.number,
  cols: PropTypes.number,
  disabled: PropTypes.bool
};

export default withStyles(styles)(SeatMap);
