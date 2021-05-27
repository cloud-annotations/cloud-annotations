/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import clsx from "clsx";

import { useClickOutside } from "@iris/hooks";

import Divider from "./Divider";
import MenuItem from "./MenuItem";
import { isDivider, Menu } from "./types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    options: {
      display: "flex",
      fontSize: 14,
      color: theme.palette.text.secondary,
      alignItems: "center",
    },
    baseOption: {
      position: "relative",
      marginTop: 2,
      border: "1px solid transparent",
      padding: "4px 6px",
      cursor: "pointer",
    },
    optionOpen: {
      backgroundColor: `var(--highlight)`,
      borderRadius: "4px 4px 0 0",
    },
    optionClosed: {
      "&:hover": {
        backgroundColor: `var(--highlight)`,
        borderRadius: "4px",
      },
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
      borderRadius: "0 4px 4px 4px",
      // TODO: overflow: auto;
      // This won't let us scroll, but should be okay HERE ONLY
      overflow: "visible",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: `1px solid ${theme.palette.grey[600]}`, // dropDownBorder
    },
    cardOpen: {
      visibility: "visible",
    },
    cardClosed: {
      visibility: "hidden",
    },
  })
);

interface Props {
  menus: Menu[];
}

function ToolbarMenus({ menus }: Props) {
  const classes = useStyles();

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [lastHoveredOption, setLastHoveredOption] = useState(undefined);
  const [lastHoveredSubOption, setLastHoveredSubOption] = useState(undefined);

  const handleOptionClick = useCallback(() => {
    setOptionsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setLastHoveredOption(undefined);
    setLastHoveredSubOption(undefined);
    setOptionsOpen(false);
  }, []);

  const handleOptionHover = useCallback((e) => {
    setLastHoveredOption(e.currentTarget.id);
    setLastHoveredSubOption(undefined);
  }, []);

  const handleSubOptionHover = useCallback((e) => {
    // TODO: Create some sort of timer to prevent opening other menus.
    setLastHoveredSubOption(e.currentTarget.id);
  }, []);

  const { ref: optionsRef } = useClickOutside<HTMLDivElement>(handleClose, {
    hideOnBlur: true,
  });

  return (
    <div ref={optionsRef} className={classes.options}>
      {menus.map((menu) => {
        return (
          <div
            key={menu.name}
            id={menu.name}
            className={clsx(
              classes.baseOption,
              optionsOpen && lastHoveredOption === menu.name
                ? classes.optionOpen
                : classes.optionClosed
            )}
            onClick={handleOptionClick}
            onMouseEnter={handleOptionHover}
          >
            {menu.name}
            <div
              className={clsx(
                classes.baseCard,
                optionsOpen && lastHoveredOption === menu.name
                  ? classes.cardOpen
                  : classes.cardClosed
              )}
            >
              {menu.items.map((item, i) => {
                if (isDivider(item)) {
                  return <Divider key={menu.name + "---divider" + i} />;
                }

                const id = menu.name + "---" + item.name;
                const open = optionsOpen && lastHoveredSubOption === id;

                return (
                  <MenuItem
                    key={id}
                    id={id}
                    open={open}
                    item={item}
                    onMouseEnter={handleSubOptionHover}
                    onClose={handleClose}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ToolbarMenus;
