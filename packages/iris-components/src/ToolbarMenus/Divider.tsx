import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listDivider: {
      margin: "6px 0",
      height: 1,
      background: theme.palette.grey[600], // listDivider
    },
  })
);

function Divider() {
  const classes = useStyles();
  return <div className={classes.listDivider} />;
}

export default Divider;
