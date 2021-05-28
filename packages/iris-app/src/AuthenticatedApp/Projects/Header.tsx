/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: theme.palette.grey[800],
    },
    projectButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: 64,
    },
    projectIcon: {
      // background: "black",
      // borderRadius: 4,
      // padding: 6,
      width: 20,
      height: 20.5,
    },
    project: {
      marginLeft: 6,
      marginRight: "auto",
      height: "100%",
      display: "flex",
      alignItems: "center",
    },
    projectName: {
      fontSize: 22,
      color: "var(--brightText)",
      padding: "2px 8px",
    },
  })
);

function Header() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.projectButton}>
        <svg className={classes.projectIcon} viewBox="0 0 40 41">
          <rect fill="white" x="0" y="0" width="8" height="8" />
          <rect fill="white" x="32" y="0" width="8" height="8" />
          <rect fill="white" x="0" y="33" width="8" height="8" />
          <rect fill="white" x="32" y="33" width="8" height="8" />
          <rect fill="white" x="4" y="8" width="4" height="25" />
          <rect fill="white" x="32" y="8" width="4" height="25" />
          <rect fill="white" x="8" y="5" width="24" height="3" />
          <rect fill="white" x="8" y="33" width="24" height="3" />
        </svg>
        {/* <svg className={classes.projectIcon} viewBox="0 0 200 200">
          <rect fill="white" x="35" y="35" width="20" height="20" />
          <rect fill="white" x="145" y="35" width="20" height="20" />
          <rect fill="white" x="35" y="145" width="20" height="20" />
          <rect fill="white" x="145" y="145" width="20" height="20" />
          <rect fill="white" x="45" y="55" width="10" height="90" />
          <rect fill="white" x="145" y="55" width="10" height="90" />
          <rect fill="white" x="55" y="45" width="90" height="10" />
          <rect fill="white" x="55" y="145" width="90" height="10" />
        </svg> */}
      </div>

      <div className={classes.project}>
        <div className={classes.projectName}>Iris</div>
      </div>
    </div>
  );
}

export default Header;
