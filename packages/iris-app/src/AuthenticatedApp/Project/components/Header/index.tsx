/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import {
  showConfirmDialog,
  showFileDialog,
  ToolbarMenus,
} from "@iris/components";
import { Menu } from "@iris/components/dist/ToolbarMenus/types";
import {
  useSelectedImagesCount,
  useLabels,
  NEW_ANNOTATION,
  useProjectName,
  useProjectStatus,
  NEW_LABEL,
  DELETE_IMAGES,
  UPLOAD_IMAGES,
} from "@iris/core";
import { IrisLogo } from "@iris/icons";

import { createJPEGs } from "../image-utils";

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
    projectLink: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 48,
      width: 48,
      borderRadius: 4,
      "&:hover": {
        backgroundColor: "var(--highlight)",
      },
    },
    projectIcon: {
      // background: "black",
      // borderRadius: 4,
      // padding: 6,
      // width: 46,
      // height: 44,
      width: 20,
      height: 20.5,
    },
    project: {
      marginLeft: 6,
      marginRight: "auto",
      height: "100%",
    },
    projectName: {
      fontSize: 18,
      color: "var(--brightText)",
      marginTop: 9,
      padding: "2px 8px",
    },
    menus: {
      display: "flex",
      fontSize: 14,
      color: "var(--secondaryText)",
      alignItems: "center",
    },
    saveStatus: {
      position: "relative",
      marginTop: 2,
      border: "1px solid transparent",
      padding: "4px 6px",
      cursor: "pointer",
      marginLeft: 14,
      color: "var(--detailText)",
    },
  })
);

interface Props {
  name: string;
  saving: boolean;
  menus: Menu[];
  backLink?: string;
}

function Header({ name, saving, menus, backLink }: Props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.projectButton}>
        {backLink ? (
          <Link to={backLink} className={classes.projectLink}>
            <IrisLogo className={classes.projectIcon} />
          </Link>
        ) : (
          <IrisLogo className={classes.projectIcon} />
        )}
      </div>

      <div className={classes.project}>
        <div className={classes.projectName}>{name}</div>
        <div className={classes.menus}>
          <ToolbarMenus menus={menus} />
          <div className={classes.saveStatus}>
            {saving ? "Saving..." : "Saved"}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderController() {
  const name = useProjectName();
  const status = useProjectStatus();

  const { pathname } = useLocation();

  const dispatch = useDispatch();

  const selected = useSelectedImagesCount();
  const labels = useLabels();

  const menus: Menu[] = [
    {
      name: "File",
      items: [
        {
          name: "Upload media",
          action: async () => {
            const files = await showFileDialog({
              accept: "image/*,video/*",
              multiple: true,
            });
            // TODO: Should we be able to dispatch "files" instead of JPEGs?
            const jpegs = await createJPEGs(files ?? []);
            dispatch(UPLOAD_IMAGES(jpegs));
          },
        },
      ],
    },
    {
      name: selected > 1 ? `Images (${selected})` : "Image",
      items: [
        {
          name: "Delete",
          action: async () => {
            const shouldDeleteImages = await showConfirmDialog({
              title:
                selected > 1 ? `Delete ${selected} images?` : "Delete image?",
              primary: "Delete",
              danger: true,
            });
            if (shouldDeleteImages) {
              dispatch(DELETE_IMAGES());
            }
          },
        },
        { divider: true },
        {
          name: 'Mark as "negative"',
          action: () => {
            let labelID = labels.find((l) => l.name === "negative")?.id;
            if (labelID === undefined) {
              const action = NEW_LABEL("negative");
              labelID = action.payload.id;
              dispatch(action);
            }
            dispatch(NEW_ANNOTATION({ label: labelID, tool: "tag" }));
          },
        },
        {
          name: "Mark as",
          disabled: labels.length === 0,
          items: labels.map((l) => ({
            name: l.name,
            action: () => {
              dispatch(NEW_ANNOTATION({ label: l.id, tool: "tag" }));
            },
          })),
        },
      ],
    },
  ];

  const backLink = pathname.split("/").slice(0, -1).join("/");
  return (
    <Header
      name={name ?? ""}
      saving={status === "saving"}
      menus={menus}
      backLink={pathname.startsWith("/projects/") ? backLink : undefined}
    />
  );
}

export default HeaderController;
