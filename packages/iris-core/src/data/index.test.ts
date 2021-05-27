/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createStore } from "@reduxjs/toolkit";

import reducer, {
  DELETE_ANNOTATION,
  DELETE_LABEL,
  NEW_ANNOTATION,
  NEW_LABEL,
  RENAME_LABEL,
  SELECT_IMAGE,
  UPDATE_ANNOTATION,
} from ".";
import { load } from "../load";

describe("project data reducer", () => {
  it("can create/rename/delete labels", () => {
    const store = createStore(reducer);

    store.dispatch({
      type: NEW_LABEL.type,
      payload: {
        id: "test-label-id1",
        name: "test label1",
      },
    });

    expect(store.getState().labels.data).toMatchInlineSnapshot(`
      Object {
        "test-label-id1": Object {
          "id": "test-label-id1",
          "name": "test label1",
        },
      }
    `);

    store.dispatch({
      type: NEW_LABEL.type,
      payload: {
        id: "test-label-id2",
        name: "test label2",
      },
    });
    expect(store.getState().labels.data).toMatchInlineSnapshot(`
      Object {
        "test-label-id1": Object {
          "id": "test-label-id1",
          "name": "test label1",
        },
        "test-label-id2": Object {
          "id": "test-label-id2",
          "name": "test label2",
        },
      }
    `);

    store.dispatch({
      type: RENAME_LABEL.type,
      payload: {
        id: "test-label-id1",
        name: "renamed label",
      },
    });
    expect(store.getState().labels.data).toMatchInlineSnapshot(`
      Object {
        "test-label-id1": Object {
          "id": "test-label-id1",
          "name": "renamed label",
        },
        "test-label-id2": Object {
          "id": "test-label-id2",
          "name": "test label2",
        },
      }
    `);

    store.dispatch({
      type: DELETE_LABEL.type,
      payload: "test-label-id2",
    });
    expect(store.getState().labels.data).toMatchInlineSnapshot(`
      Object {
        "test-label-id1": Object {
          "id": "test-label-id1",
          "name": "renamed label",
        },
      }
    `);

    store.dispatch({
      type: DELETE_LABEL.type,
      payload: "test-label-id1",
    });
    expect(store.getState().labels.data).toMatchInlineSnapshot(`Object {}`);
  });

  it("doesn't create duplicate labels", () => {
    const store = createStore(reducer);

    store.dispatch({
      type: NEW_LABEL.type,
      payload: { id: "1", name: "duplicate" },
    });

    store.dispatch({
      type: NEW_LABEL.type,
      payload: { id: "2", name: "duplicate" },
    });

    expect(store.getState().labels.data).toMatchInlineSnapshot(`
      Object {
        "1": Object {
          "id": "1",
          "name": "duplicate",
        },
      }
    `);
  });

  it("doesn't create an annotation if no image is selected", () => {
    const store = createStore(reducer);

    store.dispatch({
      type: NEW_LABEL.type,
      payload: { id: "1", name: "label1" },
    });

    store.dispatch({
      type: NEW_ANNOTATION.type,
      payload: {
        id: "1",
        label: "label1",
      },
    });

    expect(store.getState().annotations.data).toMatchInlineSnapshot(
      `Object {}`
    );
  });

  it("doesn't create an annotation if label doesn't exist", () => {
    const store = createStore(reducer);

    store.dispatch({
      type: SELECT_IMAGE.type,
      payload: "image1",
    });

    store.dispatch({
      type: NEW_ANNOTATION.type,
      payload: {
        id: "1",
        label: "label1",
      },
    });

    expect(store.getState().annotations.data).toMatchInlineSnapshot(
      `Object {}`
    );
  });

  it("creates an annotation", () => {
    const store = createStore(reducer);

    store.dispatch({
      type: load.fulfilled.type,
      payload: {
        labels: { label1: { id: "label1", name: "Label 1" } },
        images: { image1: { id: "image1" } },
        annotations: {},
      },
    });

    store.dispatch({
      type: SELECT_IMAGE.type,
      payload: "image1",
    });

    store.dispatch({
      type: NEW_ANNOTATION.type,
      payload: {
        id: "annotation1",
        label: "label1",
      },
    });

    expect(store.getState().images.data).toMatchInlineSnapshot(`
      Object {
        "image1": Object {
          "annotations": Array [
            "annotation1",
          ],
          "id": "image1",
        },
      }
    `);

    expect(store.getState().annotations.data).toMatchInlineSnapshot(`
      Object {
        "annotation1": Object {
          "id": "annotation1",
          "label": "label1",
        },
      }
    `);
  });

  it("updates an annotation", () => {
    const store = createStore(reducer);

    store.dispatch({
      type: load.fulfilled.type,
      payload: {
        labels: {
          label1: { id: "label1", name: "Label 1" },
          label2: { id: "label2", name: "Label 2" },
        },
        images: { image1: { id: "image1", annotations: ["annotation1"] } },
        annotations: {
          annotation1: {
            id: "annotation1",
            label: "label1",
          },
        },
      },
    });

    store.dispatch({
      type: UPDATE_ANNOTATION.type,
      payload: {
        id: "annotation1",
        label: "label2",
      },
    });

    expect(store.getState().images.data).toMatchInlineSnapshot(`
      Object {
        "image1": Object {
          "annotations": Array [
            "annotation1",
          ],
          "id": "image1",
        },
      }
    `);

    expect(store.getState().annotations.data).toMatchInlineSnapshot(`
      Object {
        "annotation1": Object {
          "id": "annotation1",
          "label": "label2",
        },
      }
    `);
  });

  it("deletes an annotation", () => {
    const store = createStore(reducer);

    store.dispatch({
      type: load.fulfilled.type,
      payload: {
        labels: {
          label1: { id: "label1", name: "Label 1" },
          label2: { id: "label2", name: "Label 2" },
        },
        images: { image1: { id: "image1", annotations: ["annotation1"] } },
        annotations: {
          annotation1: {
            id: "annotation1",
            label: "label1",
          },
        },
      },
    });

    store.dispatch({
      type: DELETE_ANNOTATION.type,
      payload: "annotation1",
    });

    expect(store.getState().images.data).toMatchInlineSnapshot(`
      Object {
        "image1": Object {
          "annotations": Array [
            "annotation1",
          ],
          "id": "image1",
        },
      }
    `);

    expect(store.getState().annotations.data).toMatchInlineSnapshot(
      `Object {}`
    );
  });
});
