/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback, useEffect } from "react";

import { useDispatch } from "react-redux";

import { LabelSelect } from "@iris/components";
import { SELECT_LABEL, NEW_LABEL, useActiveLabel, useLabels } from "@iris/core";

function useToggleLabel() {
  const dispatch = useDispatch();

  const labels = useLabels();
  const activeLabel = useActiveLabel();

  const setActiveLabel = useCallback(
    (label) => {
      dispatch(SELECT_LABEL(label));
    },
    [dispatch]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (document.activeElement?.tagName.toLowerCase() === "input") {
        return;
      }

      const char = e.key.toLowerCase();
      if (char === "q") {
        setActiveLabel(
          labels[
            (labels.findIndex((l) => l.id === activeLabel) + 1) % labels.length
          ].id
        );
      }
      let labelIndex = parseInt(char) - 1;
      // Treat 0 as 10 because it comes after 9 on the keyboard.
      if (labelIndex < 0) {
        labelIndex = 9;
      }
      if (labelIndex < labels.length) {
        setActiveLabel(labels[labelIndex].id);
      }
    },
    [activeLabel, labels, setActiveLabel]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

function ActiveLabel() {
  const dispatch = useDispatch();

  const labels = useLabels();
  const activeLabel = useActiveLabel();

  useToggleLabel();

  const handleLabelChosen = useCallback(
    (label) => {
      dispatch(SELECT_LABEL(label));
    },
    [dispatch]
  );

  const handleNewLabel = useCallback(
    (label) => {
      const labelAction = NEW_LABEL(label);
      dispatch(labelAction);
      dispatch(SELECT_LABEL(labelAction.payload.id));
    },
    [dispatch]
  );

  return (
    <LabelSelect
      labels={labels}
      activeLabel={activeLabel ?? ""}
      placeholder="Create new label"
      onChange={handleLabelChosen}
      onNew={handleNewLabel}
    />
  );
}

export default ActiveLabel;
