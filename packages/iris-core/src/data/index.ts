/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createAction, createReducer, nanoid } from "@reduxjs/toolkit";

import { getVisibleImages } from "../hooks";
import { load } from "../load";
import store, { ProjectState } from "../store";
import { DataState, Project } from "./types";
import { labelNameExists } from "./utils";

const initialState: DataState = {
  labels: {
    data: {},
    active: undefined,
  },
  annotations: {
    data: {},
  },
  images: {
    data: {},
    active: undefined,
    filter: {},
    selection: [],
  },
  tool: {
    active: "box",
  },
};

export const NEW_LABEL = createAction(
  "[data] Create a new label",
  function prepare(name: string) {
    return {
      payload: {
        id: nanoid(),
        name,
      },
    };
  }
);

export const RENAME_LABEL = createAction<{ id: string; name: string }>(
  "[data] Rename label"
);

export const DELETE_LABEL = createAction<string>("[data] Delete label");

export const SELECT_LABEL = createAction<string>("[ui] Select label");

export const SELECT_IMAGE = createAction<string>("[ui] Select image");

export const TOGGLE_IMAGE = createAction<string>("[ui] Toggle image");

export const UPDATE_IMAGE = createAction<Project.Image>("[ui] Update image");

export const DELETE_IMAGES = createAction(
  "[data] [delete-images]",
  function prepare() {
    return {
      payload: {
        activeImage: (store.getState() as ProjectState).data.images.active,
        selection: (store.getState() as ProjectState).data.images.selection,
      },
    };
  }
);

export const UPLOAD_IMAGES = createAction<{ name: string; blob: Blob }[]>(
  "[data] [upload-images]"
);

export const SELECT_TOOL = createAction<string>("[ui] Select tool");

export const NEW_ANNOTATION = createAction(
  "[data] Create new annotation",
  function prepare(annotation: Project.Annotation) {
    return {
      payload: {
        id: nanoid(),
        ...annotation,
        activeImage: (store.getState() as ProjectState).data.images.active,
      },
    };
  }
);

export const UPDATE_ANNOTATION = createAction<Project.AnnotationWithID>(
  "[data] Update annotation"
);

export const DELETE_ANNOTATION = createAction<string>(
  "[data] Delete annotation"
);

export const SHOW_ALL_IMAGES = createAction("[ui] Show all images");

export const SHOW_LABELED_IMAGES = createAction("[ui] Show labeled images");

export const SHOW_UNLABELED_IMAGES = createAction("[ui] Show unlabeled images");

export const SHOW_IMAGES_WITH_SPECIFIC_LABEL = createAction<string>(
  "[ui] Show images with specific label"
);

function deleteAnnotation(state: DataState, annotationID: string) {
  delete state.annotations.data[annotationID];
  const image = Object.values(state.images.data).find((i) =>
    i.annotations.includes(annotationID)
  );
  if (image?.id === undefined) {
    return;
  }
  const index = state.images.data[image.id].annotations.indexOf(annotationID);
  if (index !== -1) {
    state.images.data[image.id].annotations.splice(index, 1);
  }
}

const reducer = createReducer(initialState, (builder) => {
  builder.addCase(NEW_LABEL, (state, { payload }) => {
    if (!labelNameExists(state.labels.data, payload.name)) {
      state.labels.data[payload.id] = payload;
    }
  });
  builder.addCase(RENAME_LABEL, (state, { payload }) => {
    state.labels.data[payload.id] = payload;
  });
  builder.addCase(DELETE_LABEL, (state, { payload }) => {
    delete state.labels.data[payload];

    const annotations = Object.values(state.annotations.data).filter(
      (a) => a.label === payload
    );

    for (const annotation of annotations) {
      deleteAnnotation(state, annotation.id);
    }

    // TODO: update active label if we deleted it.
  });
  builder.addCase(SELECT_LABEL, (state, { payload }) => {
    state.labels.active = payload;
  });

  builder.addCase(DELETE_IMAGES, (state, { payload }) => {
    if (payload.activeImage === undefined) {
      return;
    }

    for (const selected of payload.selection) {
      delete state.images.data[selected];
    }

    delete state.images.data[payload.activeImage];

    // If the states active image matches the image that was deleted,
    // update the active image.
    if (state.images.active === payload.activeImage) {
      state.images.active = getVisibleImages({ data: state })[0]?.id;
    }
    state.images.selection = state.images.selection.filter(
      (i) => !payload.selection.includes(i)
    );
  });
  builder.addCase(SELECT_IMAGE, (state, { payload }) => {
    state.images.active = payload;
    state.images.selection = [];
  });
  builder.addCase(TOGGLE_IMAGE, (state, { payload }) => {
    if (
      state.images.selection.length === 0 &&
      state.images.active !== undefined
    ) {
      state.images.selection = [state.images.active];
    }
    const index = state.images.selection.indexOf(payload);
    if (index === -1) {
      state.images.selection.push(payload);
      state.images.active = payload;
      return;
    }
    if (state.images.selection.length > 1) {
      state.images.selection.splice(index, 1);
      state.images.active =
        state.images.selection[state.images.selection.length - 1];
      return;
    }
  });

  builder.addCase(SELECT_TOOL, (state, { payload }) => {
    state.tool.active = payload;
  });
  builder.addCase(NEW_ANNOTATION, (state, { payload }) => {
    const { activeImage, ...annotation } = payload;
    if (activeImage && state.labels.data.hasOwnProperty(annotation.label)) {
      if (state.images.data[activeImage].annotations === undefined) {
        state.images.data[activeImage].annotations = [];
      }
      state.images.data[activeImage].annotations.push(annotation.id);
      state.annotations.data[annotation.id] = annotation;
    }
  });
  builder.addCase(UPDATE_ANNOTATION, (state, { payload }) => {
    if (state.labels.data.hasOwnProperty(payload.label)) {
      state.annotations.data[payload.id] = payload;
    }
  });
  builder.addCase(DELETE_ANNOTATION, (state, { payload }) => {
    // TODO: This could be optimized if we pass the imageID.
    deleteAnnotation(state, payload);
  });

  builder.addCase(SHOW_ALL_IMAGES, (state, _action) => {
    state.images.filter.mode = undefined;
    state.images.filter.label = undefined;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });
  builder.addCase(SHOW_LABELED_IMAGES, (state, _action) => {
    state.images.filter.mode = "labeled";
    state.images.filter.label = undefined;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });
  builder.addCase(SHOW_UNLABELED_IMAGES, (state, _action) => {
    state.images.filter.mode = "unlabeled";
    state.images.filter.label = undefined;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });
  builder.addCase(SHOW_IMAGES_WITH_SPECIFIC_LABEL, (state, { payload }) => {
    state.images.filter.mode = "byLabel";
    state.images.filter.label = payload;
    state.images.selection = [];
    state.images.active = getVisibleImages({ data: state })[0]?.id;
  });

  builder.addCase(UPDATE_IMAGE, (state, { payload }) => {
    state.images.data[payload.id] = payload;
  });

  builder.addCase(load.fulfilled, (state, action) => {
    state.labels.data = action.payload.labels;
    state.labels.active = (Object.values(action.payload.labels)[0] as any)?.id;

    state.images.data = action.payload.images;

    for (const key of Object.keys(state.images.data)) {
      state.images.data[key] = {
        ...state.images.data[key],
        status: "success",
      };
    }

    state.images.active = getVisibleImages({ data: state })[0]?.id;

    state.annotations.data = action.payload.annotations;
  });
});

// - BULK_LABEL (labelID)
// - DELETE_IMAGES ()
// - UPLOAD_IMAGE (blob)

export * from "./types";
export default reducer;
