export default theme => ({
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
  },
  seat: {
    minWidth: 16,
    minHeight: 24,
    margin: 2,
    //padding: 5,
    paddingLeft: 8,
    paddingRight: 8,
    border: "1px solid #3f51b5"
  },
  disabledSeat: {
    pointerEvents: "none",
    border: "1px solid #eee"
  }
});
