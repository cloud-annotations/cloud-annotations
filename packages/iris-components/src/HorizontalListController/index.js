/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect } from "react";

import { useBlockSwipeBack } from "@iris/hooks";

import HorizontalListItem from "./HorizontalListItem";

const style = {
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  top: "0",
  display: "flex",
  overflow: "auto",
  alignItems: "center",
  backgroundColor: "var(--secondaryBg)",
  // borderTop: '1px solid #dfe3e6'
};

const HorizontalListController = ({
  cells,
  items,
  selection,
  range,
  onSelectionChanged,
}) => {
  const handleKeyDown = useCallback(
    (e) => {
      if (document.activeElement.tagName.toLowerCase() === "input") {
        return;
      }

      const char = e.key.toLowerCase();

      const left = Math.max(selection - 1, 0);
      const right = Math.min(selection + 1, items.length - 1);
      if (char === "arrowright") {
        e.preventDefault();
        onSelectionChanged(right, {});
        const target = document.getElementById(items[right]);
        if (!target) {
          return;
        }
        target.parentNode.scrollLeft =
          target.offsetLeft - (target.parentNode.offsetWidth / 2 - 208);
      } else if (char === "arrowleft") {
        e.preventDefault();
        onSelectionChanged(left, {});
        const target = document.getElementById(items[left]);
        if (!target) {
          return;
        }
        target.parentNode.scrollLeft =
          target.offsetLeft - (target.parentNode.offsetWidth / 2 - 208);
      } else if (char === " ") {
        e.preventDefault();
        onSelectionChanged(right, {});
        const target = document.getElementById(items[right]);
        if (!target) {
          return;
        }
        target.parentNode.scrollLeft =
          target.offsetLeft - (target.parentNode.offsetWidth / 2 - 208);
      }
    },
    [items, onSelectionChanged, selection]
  );

  const { ref } = useBlockSwipeBack();

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleItemSelected = useCallback(
    (e, index) => {
      onSelectionChanged(index, {
        ctrlKey: e.ctrlKey || e.metaKey,
        shiftKey: e.shiftKey,
      });
    },
    [onSelectionChanged]
  );

  return (
    <div ref={ref} style={style}>
      {cells.map((cell, i) => {
        return (
          <HorizontalListItem
            index={i}
            key={items[i].id}
            state={
              selection === i
                ? "active"
                : range.includes(i)
                ? "selected"
                : "normal"
            }
            onItemSelected={handleItemSelected}
            listItem={cell}
          />
        );
      })}
    </div>
  );
};

export default HorizontalListController;
