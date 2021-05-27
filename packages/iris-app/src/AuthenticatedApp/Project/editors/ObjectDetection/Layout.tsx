import React from "react";

import { createStyles, makeStyles } from "@material-ui/core";

const topHeight = 36;
const leftWidth = 50;
const rightWidth = 272;
const bottomHeight = 138;

interface Props {
  top: JSX.Element;
  left: JSX.Element;
  content: JSX.Element;
  right: JSX.Element;
  bottom: JSX.Element;
}

const useStyles = makeStyles(() =>
  createStyles({
    top: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: topHeight,
    },
    left: {
      position: "absolute",
      top: topHeight,
      left: 0,
      bottom: bottomHeight,
      width: leftWidth,
    },
    content: {
      position: "absolute",
      top: topHeight,
      left: leftWidth,
      right: rightWidth,
      bottom: bottomHeight,
    },
    right: {
      position: "absolute",
      top: topHeight,
      right: 0,
      bottom: bottomHeight,
      width: rightWidth,
    },
    bottom: {
      position: "absolute",
      right: 0,
      left: 0,
      bottom: 0,
      height: bottomHeight,
    },
  })
);

function Layout({ top, left, content, right, bottom }: Props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.top}>{top}</div>
      <div className={classes.left}>{left}</div>
      <div className={classes.content}>{content}</div>
      <div className={classes.right}>{right}</div>
      <div className={classes.bottom}>{bottom}</div>
    </React.Fragment>
  );
}

export default Layout;
