/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

import { endpoint } from "@iris/api";
import { CanvasView, CrossHair, EmptySet } from "@iris/components";
import {
  useActiveImageStatus,
  useActiveImageID,
  useActiveLabel,
  useLabels,
  useProjectID,
  useActiveTool,
  useShapes,
  useHeadCount,
} from "@iris/core";

import { uniqueColor } from "./color-utils";
import styles from "./styles.module.css";

const BOX = "box";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      userSelect: "none",
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      position: "absolute",
      height: 54,
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

function CanvasWrapper({
  image,
  status,
  activeColor,
  selectedTool,
  projectID,
  shapes,
}: any) {
  const classes = useStyles();

  const imageUrl = endpoint("/images/:imageID", {
    path: { imageID: image },
    query: { projectID: projectID },
  });

  switch (status) {
    case "success":
      return (
        // TODO: The plugin should set a crosshair flag.
        <CrossHair color={activeColor} active={selectedTool === BOX}>
          <CanvasView
            mode={selectedTool === "move" ? "move" : "draw"}
            image={imageUrl}
            tool={selectedTool}
            shapes={shapes}
            render={window.IRIS.tools
              .list()
              .reduce((acc: { [key: string]: any }, cur) => {
                acc[cur.id] = (...args: any[]) =>
                  cur.canvasPlugin.render(...args);
                return acc;
              }, {})}
            actions={window.IRIS.tools
              .list()
              .reduce((acc: { [key: string]: any }, cur) => {
                acc[cur.id] = {
                  onTargetMove: (...args: any[]) =>
                    cur.canvasPlugin.onTargetMove(...args),
                  onMouseDown: (...args: any[]) =>
                    cur.canvasPlugin.onMouseDown(...args),
                  onMouseMove: (...args: any[]) =>
                    cur.canvasPlugin.onMouseMove(...args),
                  onMouseUp: (...args: any[]) =>
                    cur.canvasPlugin.onMouseUp(...args),
                };
                return acc;
              }, {})}
          />
        </CrossHair>
      );
    case "error":
      return (
        <div className={classes.wrapper}>
          <div className={classes.textContainer}>
            <div className={classes.largeText}>
              An error occurred while loading the image
            </div>
            <div className={classes.smallText}>
              Try refreshing the page and make sure the image file is valid.
            </div>
          </div>
        </div>
      );
    default:
      return <EmptySet show />;
  }
}

function DrawingPanel() {
  const selectedTool = useActiveTool();
  const highlightedBox = "";
  const activeImageID = useActiveImageID();
  const activeImageStatus = useActiveImageStatus();
  const shapes = useShapes();
  const projectID = useProjectID();
  const activeLabel = useActiveLabel();
  const labels = useLabels();

  const headCount = useHeadCount();

  const cmap = labels.reduce((acc: { [key: string]: string }, label, i) => {
    acc[label.id] = uniqueColor(i, labels.length);
    return acc;
  }, {});

  const activeColor = cmap[activeLabel ?? ""] ?? "white";

  const maxBubbles = 3;
  const othersCount = Math.max(headCount - 1, 0);
  const clippedCount = Math.min(othersCount, maxBubbles);
  const overflowCount = othersCount - maxBubbles;

  const modifiedShapes = shapes.map((shape) => {
    return {
      color: cmap[shape.label],
      highlight: highlightedBox === shape.id,
      ...shape,
    };
  });

  return (
    <div className={styles.wrapper}>
      <div className={styles.roomHolder}>
        {[...new Array(clippedCount)].map(() => (
          <div className={styles.chatHead}>
            <div>
              <svg
                className={styles.chatHeadIcon}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="2 2 28 28"
              >
                <path d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2zm0 5a4.5 4.5 0 1 1-4.5 4.5A4.49 4.49 0 0 1 16 7zm8 17.92a11.93 11.93 0 0 1-16 0v-.58A5.2 5.2 0 0 1 13 19h6a5.21 5.21 0 0 1 5 5.31v.61z"></path>
              </svg>
            </div>
          </div>
        ))}
        {overflowCount > 0 && (
          <div className={styles.chatHeadOverflow}>
            <div>+{overflowCount}</div>
          </div>
        )}
      </div>
      <CanvasWrapper
        image={activeImageID}
        status={activeImageStatus}
        activeColor={activeColor}
        selectedTool={selectedTool}
        projectID={projectID}
        shapes={modifiedShapes}
      />
    </div>
  );
}

export default DrawingPanel;
