/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import clsx from "clsx";

import Divider from "./Divider";
import Chevron from "./icons/Chevron";
import Tooltip from "./icons/Tooltip";
import { isDivider, isSubMenuItem, isTooltipMenuItem, MenuItem } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "relative",
    },
    open: {
      backgroundColor: `var(--highlight)`,
    },
    baseCard: {
      position: "absolute",
      zIndex: 10,
      top: "calc(100% + 1px)",
      left: -1,
      padding: "6px 0",
      color: theme.palette.text.secondary,
      backgroundColor: theme.palette.grey[800], // NOTE: secondaryBg = 181c1e, this is closest match
      maxHeight: "calc(80vh - 174px)",
      minWidth: 185,
      maxWidth: 314,
      borderRadius: " 0 4px 4px 4px",
      // TODO: overflow: auto;
      // This won't let us scroll, but should be okay HERE ONLY
      overflow: "visible",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: `1px solid ${theme.palette.grey[600]}`, // dropDownBorder
    },
    popoutOpen: {
      visibility: "visible",
      overflow: "auto",
      left: "calc(100% - 2px)",
      top: 0,
      borderRadius: 4,
    },
    baseListItem: {
      position: "relative",
      padding: "8px 42px 8px 14px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    listItem: {
      "&:hover": {
        backgroundColor: `var(--highlight)`,
      },
      fill: theme.palette.text.secondary,
    },
    listItemDisabled: {
      cursor: "default",
      pointerEvents: "none",
      color: theme.palette.text.disabled,
      // NOTE: chevronRightIcon
      fill: theme.palette.text.disabled,
    },
    icon: {
      height: 16,
      width: 16,
      position: "absolute",
      right: 14,
      fill: "inherit",
    },
  })
);

interface FlyOutProps {
  item: MenuItem;
  onClose: any;
}

function FlyOut({ item, onClose }: FlyOutProps) {
  const classes = useStyles();

  if (isSubMenuItem(item)) {
    return (
      <div className={clsx(classes.baseCard, classes.popoutOpen)}>
        {item.items.map((subItem) => {
          if (isDivider(subItem)) {
            return <Divider />;
          }

          return (
            <div
              className={clsx(
                classes.baseListItem,
                subItem.disabled ? classes.listItemDisabled : classes.listItem
              )}
              onClick={(e) => {
                e.stopPropagation();
                subItem.action?.();
                onClose();
              }}
            >
              {subItem.name}
            </div>
          );
        })}
      </div>
    );
  }

  // TODO: Add tooltip menu back
  // if (isTooltipMenuItem(item)) {
  //   return (
  //     <div className={classes.popoutOpenTooltip}>
  //       <div className={classes.tooltipper}>
  //         <h6 className={classes.tooltipH6}>{item.tooltip.title}</h6>
  //         <p className={classes.tooltipP}>{item.tooltip.description}</p>
  //         <div className={classes.tooltipFooter}>
  //           <a
  //             href={item.tooltip.link}
  //             target="_blank"
  //             rel="noopener noreferrer"
  //             className={classes.tooltipLink}
  //           >
  //             Learn more
  //           </a>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return null;
}

interface ItemProps {
  id: string;
  item: MenuItem;
  onMouseEnter: any;
  onClose: any;
  open: boolean;
}

function Item({ id, item, open, onMouseEnter, onClose }: ItemProps) {
  const classes = useStyles();

  return (
    <div
      id={id}
      className={clsx(classes.root, { [classes.open]: open && !item.disabled })}
      onMouseEnter={onMouseEnter}
    >
      <div
        className={clsx(
          classes.baseListItem,
          item.disabled ? classes.listItemDisabled : classes.listItem
        )}
        onClick={(e) => {
          if (isSubMenuItem(item) || isTooltipMenuItem(item)) {
            return;
          }
          e.stopPropagation();
          item.action?.();
          onClose();
        }}
      >
        {item.name}
        {isSubMenuItem(item) && <Chevron className={classes.icon} />}
        {isTooltipMenuItem(item) && <Tooltip className={classes.icon} />}
      </div>

      {open && !item.disabled && <FlyOut item={item} onClose={onClose} />}
    </div>
  );
}

export default Item;
