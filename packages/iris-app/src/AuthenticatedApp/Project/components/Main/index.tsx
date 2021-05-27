/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useDropzone } from "react-dropzone";
import { useDispatch } from "react-redux";

import { UPLOAD_IMAGES } from "@iris/core";

import { createJPEGs } from "../image-utils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropzone: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      outline: "none",
    },
    dropActive: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      padding: 12,
      color: "var(--detailText)",
      background: `radial-gradient(
        ellipse at center,
        var(--dropzoneGrad1) 0%,
        var(--dropzoneGrad2) 65%,
        var(--dropzoneGrad2) 100%
      )`,
      transition: "visibility 0.2s, opacity 0.2s;",
      visibility: "visible",
      opacity: 1,
    },
    drop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      padding: 12,
      color: "var(--detailText)",
      visibility: "hidden",
      background: `radial-gradient(
        ellipse at center,
        var(--dropzoneGrad1) 0%,
        var(--dropzoneGrad2) 65%,
        var(--dropzoneGrad2) 100%
      )`,
      opacity: 0,
      transition: "visibility 0.2s, opacity 0.2s;",
    },
    dropOutline: {
      border: " 6px var(--textInputUnderline) dashed",
      backgroundColor: "rgba(141, 155, 165, 0.15)",
      borderRadius: 5,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    dropText: {
      fontSize: 24,
      fontWeight: 600,
    },
  })
);

interface Props {
  children?: React.ReactNode;
}

function Main({ children }: Props) {
  const classes = useStyles();

  const dispatch = useDispatch();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const jpegs = await createJPEGs(acceptedFiles);
      dispatch(UPLOAD_IMAGES(jpegs));
    },
    [dispatch]
  );

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: "image/*,video/*",
  });

  return (
    <div className={classes.dropzone} {...getRootProps()}>
      <div className={isDragActive ? classes.dropActive : classes.drop}>
        <div className={classes.dropOutline}>
          <div className={classes.dropText}>Drop to upload your images</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default Main;
