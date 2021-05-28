/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import produce from "immer";

import {
  store,
  CanvasPlugin,
  Canvas,
  UPDATE_ANNOTATION,
  NEW_ANNOTATION,
  NEW_LABEL,
} from "@iris/core";

function constructBox(shape: Canvas.Shape) {
  if (shape.targets === undefined) {
    return;
  }
  const xMin = Math.min(...shape.targets.map((t) => t.x));
  const yMin = Math.min(...shape.targets.map((t) => t.y));
  const xMax = Math.max(...shape.targets.map((t) => t.x));
  const yMax = Math.max(...shape.targets.map((t) => t.y));

  return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin };
}

class BoxCanvasPlugin implements CanvasPlugin {
  editing: string | null = null;
  dragging = false;

  onTargetMove(point: Canvas.Point, { shapeID, targetID }: Canvas.TouchTarget) {
    const shape = store.getState().data.annotations.data[shapeID];

    const newShape = produce(shape, (draft) => {
      const { targets, connections } = draft;
      if (targets === undefined || connections === undefined) {
        // this should never happen.
        console.error("BOX.onMove: missing stuff is undefined");
        return;
      }

      const txy = targets.find((t) => t.id === targetID);

      if (txy === undefined) {
        // this should never happen.
        console.error("BOX.onMove: target is undefined");
        return;
      }

      const connect = connections[txy.id];

      const tx = targets.find((t) => t.id === connect.x);
      const ty = targets.find((t) => t.id === connect.y);

      if (tx !== undefined && ty !== undefined) {
        txy.x = point.x;
        txy.y = point.y;

        tx.x = point.x;
        ty.y = point.y;
      }
    });

    store.dispatch(UPDATE_ANNOTATION(newShape));
    return;
  }

  onMouseDown() {
    this.dragging = true;
  }

  onMouseMove(point: Canvas.Point) {
    if (this.dragging === false) {
      return;
    }

    if (this.editing === null) {
      let label = store.getState().data.labels.active;

      if (label === undefined) {
        const action = NEW_LABEL("Untitled Label");
        label = action.payload.id;
        store.dispatch(action);
      }

      const action = NEW_ANNOTATION({
        label,
        tool: "box",
        connections: {
          "0": { x: "1", y: "3" },
          "1": { x: "0", y: "2" },
          "2": { x: "3", y: "1" },
          "3": { x: "2", y: "0" },
        },
        targets: [
          { id: "0", x: point.x, y: point.y },
          { id: "1", x: point.x, y: point.y },
          { id: "2", x: point.x, y: point.y },
          { id: "3", x: point.x, y: point.y },
        ],
      });

      this.editing = action.payload.id;
      store.dispatch(action);
      return;
    }

    const shape = store.getState().data.annotations.data[this.editing];
    if (shape !== undefined) {
      const newShape = produce(shape, (draft) => {
        if (draft.targets === undefined) {
          return;
        }
        draft.targets[1].y = point.y;
        draft.targets[2].x = point.x;
        draft.targets[2].y = point.y;
        draft.targets[3].x = point.x;
      });
      store.dispatch(UPDATE_ANNOTATION(newShape));
    }
  }

  onMouseUp(_point: Canvas.Point, xScale: number, yScale: number) {
    if (this.dragging === true && this.editing === null) {
      // click then click mode (vs drag to draw)
      return;
    }

    if (this.editing !== null) {
      const shape = store.getState().data.annotations.data[this.editing];
      if (shape?.targets !== undefined) {
        const xMin = Math.min(...shape.targets.map((t) => t.x));
        const yMin = Math.min(...shape.targets.map((t) => t.y));
        const xMax = Math.max(...shape.targets.map((t) => t.x));
        const yMax = Math.max(...shape.targets.map((t) => t.y));
        const width = xMax - xMin;
        const height = yMax - yMin;
        if (width * xScale <= 4 && height * yScale <= 4) {
          // click then click mode (vs drag to draw)
          return;
        }
      }
    }
    this.dragging = false;
    this.editing = null;
  }

  render(ctx: Canvas.Context, shape: Canvas.Shape) {
    const box = constructBox(shape);
    if (box === undefined) {
      return;
    }

    ctx.drawBox(box, {
      color: shape.color,
      highlight: shape.highlight,
    });
  }
}

export default BoxCanvasPlugin;
