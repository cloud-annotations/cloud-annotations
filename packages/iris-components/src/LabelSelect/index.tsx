/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useCallback, useEffect, useRef } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import clsx from "clsx";

import { useClickOutside } from "@iris/hooks";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    labelDropDownOpen: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      color: theme.palette.text.secondary,
      fontSize: 12,
      fontWeight: 500,
      padding: "3.5px 6px 3.5px 8px",
      width: 160,
      cursor: "pointer",
    },
    labelDropDown: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      color: theme.palette.text.secondary,
      fontSize: 12,
      fontWeight: 500,
      padding: "3.5px 6px 3.5px 8px",
      width: 160,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: theme.palette.action.hover, // highlight
        borderRadius: 4,
      },
    },
    cardOpen: {
      position: "absolute",
      top: "100%",
      left: 6,
      zIndex: 10,
      backgroundColor: theme.palette.grey[800],
      maxHeight: "calc(80vh - 174px)",
      width: 185,
      borderRadius: "0 4px 4px 4px",
      overflow: "auto",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: `1px solid ${theme.palette.grey[600]}`, // dropDownBorder
    },
    card: {
      position: "absolute",
      top: "100%",
      left: 6,
      zIndex: 10,
      backgroundColor: theme.palette.grey[800],
      maxHeight: "calc(80vh - 174px)",
      width: 185,
      borderRadius: "0 4px 4px 4px",
      overflow: "auto",
      boxShadow:
        "0 1px 3px 0 rgba(0, 0, 0, 0.23), 0 4px 8px 3px rgba(0, 0, 0, 0.11)",
      border: `1px solid ${theme.palette.grey[600]}`, // dropDownBorder
      visibility: "hidden",
    },
    listItem: {
      padding: "10px 6px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      "&:hover": {
        backgroundColor: theme.palette.action.hover, // highlight
      },
    },
    listItemSelected: {
      backgroundColor: theme.palette.action.hover, // highlight
    },
    editTextWrapperOpen: {
      fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
      fontWeight: 500,
      fontSize: 12,
      color: theme.palette.text.primary,
      height: 19,
      width: 122,
      paddingLeft: 4,
      border: "none",
      outline: "none",
      marginRight: "auto",
      backgroundColor: theme.palette.grey[700], // textInput
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
    },
    editTextWrapper: {
      fontFamily: '"ibm-plex-sans", Helvetica Neue, Arial, sans-serif',
      fontWeight: 500,
      fontSize: 12,
      color: theme.palette.text.primary,
      height: 19,
      width: 122,
      paddingLeft: 4,
      border: "none",
      outline: "none",
      marginRight: "auto",
      backgroundColor: "transparent",
    },
    dropDownIcon: {
      fill: theme.palette.text.secondary,
      right: 0,
      position: "absolute",
      top: 0,
      height: "100%",
      width: 28,
      padding: " 0 8px",
    },
    queryHighlight: {
      color: theme.palette.primary.light,
    },
  })
);

interface Label {
  name: string;
  id: string;
}

export interface Props {
  labels: Label[];
  activeLabel: string;
  placeholder?: string;
  onChange: (labelID: string) => any;
  onNew: (labelName: string) => any;
  onFocusChange?: (focused: boolean) => any;
}

function LabelSelect({
  labels,
  activeLabel,
  placeholder,
  onChange,
  onNew,
  onFocusChange,
}: Props) {
  const classes = useStyles();

  const [labelOpen, setLabelOpen] = useState(false);
  const [labelEditingValue, setEditingLabelValue] =
    useState<string | undefined>(undefined);

  const inputRef = useRef<HTMLInputElement>(null);

  const setFocus = useCallback(
    (f) => {
      setLabelOpen(f);
      if (onFocusChange) {
        onFocusChange(f);
      }
    },
    [onFocusChange]
  );

  const { ref } = useClickOutside<HTMLDivElement>(() => {
    setEditingLabelValue(undefined);
    setFocus(false);
  });

  useEffect(() => {
    // calling this directly after setEditing doesn't work, which is why we need
    // to use and effect.
    if (labelOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [labelOpen]);

  const handleChange = useCallback((e) => {
    setEditingLabelValue(e.target.value);
  }, []);

  const handleClick = useCallback(() => {
    setFocus(true);
  }, [setFocus]);

  const query = (labelEditingValue ?? "").trim();

  const handleLabelChosen = useCallback(
    (labelID) => (e: any) => {
      e.stopPropagation();
      if (labelID === "freeform") {
        onNew(query);
      } else {
        onChange(labelID);
      }
      setEditingLabelValue(undefined);
      setFocus(false);
    },
    [onChange, onNew, query, setFocus]
  );

  const filteredLabels =
    query === ""
      ? labels
      : labels
          // If the query is at the begining of the label.
          .filter(
            (item) => item.name.toLowerCase().indexOf(query.toLowerCase()) === 0
          )
          // Only sort the list when we filter, to make it easier to see diff.
          .sort((a, b) => a.name.length - b.name.length);

  const items = filteredLabels.map((label) => {
    return {
      label: label.name,
      value: label.id,
    };
  });

  if (query) {
    items.push({ label: `Create label "${query}"`, value: "freeform" });
  }

  const handleKeyDown = useCallback(
    (e) => {
      if (e.code === "Enter") {
        const selected = items[0];
        if (query !== "" && selected !== undefined) {
          if (selected.value === "freeform") {
            onNew(query);
          } else {
            onChange(selected.value);
          }
        }
        setEditingLabelValue(undefined);
        setFocus(false);
        return;
      }
      if (e.code === "Escape") {
        setEditingLabelValue(undefined);
        setFocus(false);
        return;
      }
    },
    [items, onChange, onNew, query, setFocus]
  );

  const activeLabelObj = labels.find((l) => l.id === activeLabel);
  const activeLabelName = activeLabelObj?.name;

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={labelOpen ? classes.labelDropDownOpen : classes.labelDropDown}
    >
      {items.length > 0 && (
        <div className={labelOpen ? classes.cardOpen : classes.card}>
          {items.map((label, i) => (
            <div
              className={clsx(classes.listItem, {
                [classes.listItemSelected]: query.length > 0 && i === 0,
              })}
              key={label.value}
              onClick={handleLabelChosen(label.value)}
            >
              {label.value === "freeform" ? (
                label.label
              ) : (
                <React.Fragment>
                  <span className={classes.queryHighlight}>
                    {label.label.substring(0, query.length)}
                  </span>
                  {label.label.substring(query.length)}
                </React.Fragment>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        className={
          labelOpen ? classes.editTextWrapperOpen : classes.editTextWrapper
        }
        readOnly={!labelOpen}
        // disabled={!labelOpen} this causes issues in FireFox
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        // We need to use undefined because an empty string is falsy
        value={
          labelEditingValue !== undefined
            ? labelEditingValue
            : activeLabelName ?? "" // If active label happens to be undefined the component will become uncontrolled.
        }
        placeholder={placeholder}
        type="text"
      />

      <svg
        onClick={(e) => {
          if (labelOpen) {
            e.stopPropagation();
            setEditingLabelValue(undefined);
            setFocus(false);
          }
        }}
        className={classes.dropDownIcon}
        style={labelOpen ? { transform: "rotate(-180deg)" } : undefined}
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="M8 11L3 6l.7-.7L8 9.6l4.3-4.3.7.7z" />
      </svg>
    </div>
  );
}

export default LabelSelect;
