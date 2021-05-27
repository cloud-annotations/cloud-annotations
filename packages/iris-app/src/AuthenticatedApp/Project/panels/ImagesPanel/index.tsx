/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from "react";

import { useDispatch } from "react-redux";

import { endpoint } from "@iris/api";
import {
  HorizontalListController,
  ImageTile,
  showConfirmDialog,
} from "@iris/components";
import {
  DELETE_LABEL,
  SHOW_ALL_IMAGES,
  SHOW_LABELED_IMAGES,
  SHOW_UNLABELED_IMAGES,
  SHOW_IMAGES_WITH_SPECIFIC_LABEL,
  TOGGLE_IMAGE,
  useActiveImageID,
  useFilteredImageCount,
  useFilterMode,
  useImages,
  useLabelsWithInfo,
  useLabelFilter,
  useSelectedImages,
  useProjectID,
  SELECT_IMAGE,
  UPDATE_IMAGE,
} from "@iris/core";
import { useBlockSwipeBack } from "@iris/hooks";

import classes from "./styles.module.css";

const filterMap = {
  all: "All Images",
  labeled: "Labeled",
  unlabeled: "Unlabeled",
  byLabel: "",
};

function ImagesPanel() {
  const dispatch = useDispatch();

  const projectID = useProjectID();

  const filterMode = useFilterMode();
  const filter = useLabelFilter();

  const images = useImages();
  const selection = useSelectedImages();
  const activeImage = useActiveImageID();

  const range = selection.map((s) => images.findIndex((i) => i.id === s));

  const selectedIndex = images.findIndex((i) => i.id === activeImage);

  const labels = useLabelsWithInfo();

  const { ref: scrollElementRef } = useBlockSwipeBack<HTMLDivElement>();

  const cells = images.map((i) => {
    const e = endpoint("/images/:imageID", {
      path: { imageID: i.id },
      query: { projectID: projectID },
    });
    return (
      <ImageTile
        status={i.status}
        url={e}
        targets={
          // TODO: We should probably have some sort of thumbnail coords for the
          // plugin to render this for situations like pixelmaps that won't have
          // targets.
          filter !== undefined
            ? i.resolvedAnnotations
                .filter((a) => a.label === filter && a.targets !== undefined)
                .map((a) => a.targets)
            : undefined
        }
        onError={() => {
          dispatch(
            UPDATE_IMAGE({
              ...i,
              status: "error",
            })
          );
        }}
      />
    );
  });

  const handleSelectionChanged = useCallback(
    (selection, key) => {
      if (key.shiftKey) {
        // TODO
      } else if (key.ctrlKey) {
        dispatch(TOGGLE_IMAGE(images[selection].id));
      } else {
        dispatch(SELECT_IMAGE(images[selection].id));
      }
    },
    [dispatch, images]
  );

  const handleDelete = useCallback(
    (label) => async (e: any) => {
      e.stopPropagation();
      const deleteTheLabel = await showConfirmDialog({
        title: "Delete label?",
        body: `This will also delete any bounding boxes with the label "${label.name}".`,
        primary: "Delete",
        danger: true,
      });
      if (deleteTheLabel) {
        dispatch(DELETE_LABEL(label.id));
      }
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (e) => {
      switch (e.target.value) {
        case "all":
          dispatch(SHOW_ALL_IMAGES());
          break;
        case "labeled":
          dispatch(SHOW_LABELED_IMAGES());
          break;
        case "unlabeled":
          dispatch(SHOW_UNLABELED_IMAGES());
          break;
      }
    },
    [dispatch]
  );

  const handleClickLabel = useCallback(
    (label) => () => {
      dispatch(SHOW_IMAGES_WITH_SPECIFIC_LABEL(label.id));
    },
    [dispatch]
  );

  const handleShowAllImage = useCallback(() => {
    dispatch(SHOW_ALL_IMAGES());
  }, [dispatch]);

  const filterImageModeCount = useFilteredImageCount();

  return (
    <div className={classes.wrapper}>
      <div className={classes.labelFilterWrapper}>
        {filterMode === "byLabel" ? (
          <div
            onClick={handleShowAllImage}
            className={classes.filterNotSelected}
          >
            Show all images
          </div>
        ) : (
          <React.Fragment>
            <div className={classes.labelCount}>
              {filterImageModeCount.toLocaleString()}
            </div>
            <select
              className={classes.filter}
              onChange={handleFilterChange}
              value={filterMode}
            >
              <option value="all">{filterMap.all}</option>
              <option value="labeled">{filterMap.labeled}</option>
              <option value="unlabeled">{filterMap.unlabeled}</option>
            </select>
          </React.Fragment>
        )}

        <div ref={scrollElementRef} className={classes.labelList}>
          {labels.map((label) => (
            <div
              key={label.id}
              className={
                filter === label.id
                  ? classes.selectedLabelItem
                  : classes.labelItem
              }
              onClick={handleClickLabel(label)}
            >
              <div>{label.name}</div>
              <div className={classes.labelItemCount}>
                {label.count.toLocaleString()}
              </div>
              <div onClick={handleDelete(label)} className={classes.deleteIcon}>
                <svg height="12px" width="12px" viewBox="2 2 36 36">
                  <g>
                    <path d="m31.6 10.7l-9.3 9.3 9.3 9.3-2.3 2.3-9.3-9.3-9.3 9.3-2.3-2.3 9.3-9.3-9.3-9.3 2.3-2.3 9.3 9.3 9.3-9.3z" />
                  </g>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={classes.imageList}>
        <HorizontalListController
          items={images}
          cells={cells}
          range={range}
          selection={selectedIndex}
          onSelectionChanged={handleSelectionChanged}
        />
      </div>
    </div>
  );
}

export default ImagesPanel;
