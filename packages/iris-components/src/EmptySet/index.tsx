import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      width: 430,
      height: 430,
      margin: "auto",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      userSelect: "none",
    },
    circle: {
      background: theme.palette.grey[800],
      borderRadius: "50%",
      width: 350,
      height: 350,
      position: "absolute",
      left: 40,
      top: 65,
    },
    image1: {
      width: 100,
      height: 125,
      position: "absolute",
      top: 150,
      left: 160,
      transform: "rotate(20deg)",
      border: "3px solid #929495",
      backgroundColor: theme.palette.grey[800],
      borderRadius: 7,
    },
    image2: {
      width: 100,
      height: 125,
      position: "absolute",
      top: 150,
      left: 165,
      border: "3px solid #e1e2e2",
      backgroundColor: theme.palette.grey[800],
      borderRadius: 7,
    },
    textContainer: {
      bottom: 70,
      color: theme.palette.text.hint,
      height: 54,
      marginBottom: 0,
      marginTop: 0,
      position: "absolute",
      width: 430,
    },
    largeText: {
      marginBottom: 8,
      textAlign: "center",
      color: theme.palette.text.secondary,
      fontSize: 18,
    },
    smallText: {
      marginBottom: 8,
      textAlign: "center",
      color: theme.palette.text.hint,
      fontSize: 14,
    },
  })
);

interface Props {
  show?: boolean;
}

function EmptySet({ show }: Props) {
  const classes = useStyles();

  if (!show) {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.circle} />
      <div className={classes.image1} />
      <div className={classes.image2}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-19 -71 188 236"
          fill="#26292a"
          stroke="#929495"
          strokeWidth="6px"
          strokeLinejoin="round"
        >
          <polygon points="43 48 86 107 118 76.39 150 107 150 146 0 146 0 107 43 48" />
          <circle cx="113" cy="22" r="22" />
        </svg>
      </div>
      <div className={classes.textContainer}>
        <div className={classes.largeText}>No images</div>
        <div className={classes.smallText}>Drop and drop to upload media.</div>
      </div>
    </div>
  );
}

export default EmptySet;
