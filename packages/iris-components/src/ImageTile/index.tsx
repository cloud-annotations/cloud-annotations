/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) => {
  const base = createStyles({
    root: {
      position: "relative",
      userSelect: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      height: 84,
      margin: "0 8px 8px 8px",
    },
  });
  return createStyles({
    normal: {
      ...base.root,
      "&:hover $image": {
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "&:hover $iconWrapper": {
        opacity: 0.4,
      },
    },
    active: {
      ...base.root,
      "& $image": {
        height: "71.4%",
        margin: "0 20.328px",
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "& $iconWrapper": {
        opacity: 1,
        transition: "none",
      },
      "& $highlight": {
        opacity: 1,
      },
    },
    selected: {
      ...base.root,
      "& $image": {
        height: "71.4%",
        margin: " 0 20.328px",
        border: `2px solid ${theme.palette.primary.main}`,
      },
      "&:hover $iconWrapper": {
        opacity: 0.4,
      },
      "& $highlight": {
        opacity: 1,
      },
    },
    highlight: {
      height: "100%",
      background: theme.palette.action.hover,
      position: "absolute",
      left: -6,
      right: -6,
      top: 0,
      borderRadius: 4,
      opacity: 0,
    },
    image: {
      display: "flex",
      position: "relative",
      height: "100%",
      backgroundColor: theme.palette.action.hover,
      verticalAlign: "middle",
      border: "2px solid transparent",
      borderRadius: 4,
    },
    iconWrapper: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 26,
      height: 26,
      opacity: 0,
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.25)",
    },
    icon: {
      fill: theme.palette.primary.main,
      width: 24,
      height: 24,
      margin: 1,
    },
    iconError: {
      fill: theme.palette.danger.main,
      width: 24,
      height: 24,
      margin: 1,
    },
    thumbnail: {
      display: "flex",
      flexShrink: 0,
      margin: "0 0 0 1px",
      alignItems: "center",
      justifyContent: "center",
      width: "auto",
      height: "100%",
      borderRadius: 0,
      overflow: "hidden",
      "&:first-of-type": {
        margin: 0,
        borderRadius: " 2px 1px 1px 2px",
      },
      "&:last-of-type": {
        borderRadius: "1px 2px 2px 1px",
      },
      "&:only-of-type": {
        borderRadius: 2,
      },
    },
  });
});

function CheckIcon() {
  const classes = useStyles();
  return (
    <div className={classes.iconWrapper}>
      <svg className={classes.icon} width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  const classes = useStyles();
  return (
    <div className={classes.iconWrapper} style={{ opacity: 1 }}>
      <svg
        className={classes.iconError}
        width="16"
        height="16"
        viewBox="2 2 28 28"
      >
        <path
          d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25
c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"
        />
      </svg>
    </div>
  );
}

interface StatusIconProps {
  status: "idle" | "pending" | "success" | "error";
}

function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case "success":
      return <CheckIcon />;
    case "error":
      return <ErrorIcon />;
    case "pending":
    case "idle":
      return null;
    // if status isn't set things should break.
  }
}

interface ITarget {
  x: number;
  y: number;
}

interface ListItemProps {
  targets: ITarget[];
  url: string;
}

function useThumbnail(url: string, targets: ITarget[]) {
  const rootRef = useRef<HTMLDivElement>(null);

  const [imageSize, setImageSize] = useState([0, 0]);
  const [elHeight, setElHeight] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            const img = new Image();
            img.onload = () => {
              setImageSize([img.width, img.height]);
            };
            img.src = url;
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.0,
      }
    );

    const target = rootRef.current!;
    observer.observe(target);
    return () => {
      observer.unobserve(target);
    };
  }, [url]);

  useEffect(() => {
    if (rootRef.current) {
      // @ts-ignore
      const observer = new ResizeObserver(() => {
        console.log("The element was resized");
        if (rootRef.current) {
          console.log(rootRef.current.clientHeight);
          setElHeight(rootRef.current.clientHeight);
        }
      });

      observer.observe(rootRef.current);
    }
  }, []);

  if (targets === undefined) {
    return {
      getRootProps: () => ({
        ref: rootRef,
        style: {
          backgroundImage: `url(${url})`,
          width: `${elHeight * (imageSize[0] / imageSize[1])}px`,
          height: `${100}%`,
          backgroundPosition: "0 0",
          backgroundSize: "100% 100%",
        },
      }),
    };
  }

  const xMin = Math.min(...targets.map((t) => t.x));
  const yMin = Math.min(...targets.map((t) => t.y));
  const xMax = Math.max(...targets.map((t) => t.x));
  const yMax = Math.max(...targets.map((t) => t.y));
  const width = xMax - xMin;
  const height = yMax - yMin;

  const xSize = (1 / width) * 100;
  const ySize = (1 / height) * 100;

  const xPosition = (xMin / (1 - width)) * 100;
  const yPosition = (yMin / (1 - height)) * 100;
  return {
    getRootProps: () => ({
      ref: rootRef,
      style: {
        backgroundImage: `url(${url})`,
        width: `${
          elHeight * ((imageSize[0] * width) / (imageSize[1] * height))
        }px`,
        height: `${100}%`,
        backgroundPosition: `${xPosition}% ${yPosition}%`,
        backgroundSize: `${xSize}% ${ySize}%`,
      },
    }),
  };
}

function ListItem({ targets, url }: ListItemProps) {
  const classes = useStyles();

  const { getRootProps } = useThumbnail(url, targets);

  return (
    <div className={classes.thumbnail}>
      <div {...getRootProps()} />
    </div>
  );
}

interface TileProps {
  status: "idle" | "pending" | "success" | "error";
  url: string;
  targets?: any[];
  onError?: () => any;
}

function Tile({ status, url, targets, onError }: TileProps) {
  const classes = useStyles();

  return (
    <React.Fragment>
      {targets !== undefined && targets.length > 0 ? (
        <div className={classes.image}>
          {targets.map((t, i) => (
            <ListItem key={i} targets={t} url={url} />
          ))}
        </div>
      ) : (
        <img
          draggable={false}
          className={classes.image}
          alt=""
          src={
            status === "success"
              ? url
              : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkMAYAADkANVKH3ScAAAAASUVORK5CYII="
          }
          onError={onError}
        />
      )}
      <StatusIcon status={status} />
    </React.Fragment>
  );
}

interface BaseProps {
  status: "idle" | "pending" | "success" | "error";
  state?: "active" | "selected" | "normal";
  url: string;
  targets?: any[];
  onError?: () => any;
}

function Base({ status, state, url, targets, onError }: BaseProps) {
  const classes = useStyles();

  // State should never be undefined unless it wasn't passed to the view controller.
  if (state) {
    return (
      <div className={classes[state]}>
        <div className={classes.highlight} />
        <Tile url={url} status={status} targets={targets} onError={onError} />
      </div>
    );
  }
  return null;
}

export default Base;
