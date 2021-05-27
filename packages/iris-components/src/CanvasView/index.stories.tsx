/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useRef } from "react";

import { Story } from "@storybook/react/types-6-0";
import produce from "immer";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";

import Canvas from "./";

export default {
  title: "components/Canvas",
  component: Canvas,
  argTypes: {
    image: {
      control: {
        type: "radio",
        options: [
          "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
          "https://cdn.nsarco.com/skin/bop/images/home-page/dog-with-books.jpg",
        ],
      },
    },
    mode: {
      control: {
        type: "radio",
        options: ["move", "draw"],
      },
    },
  },
};

interface ConnectionMap {
  [key: string]: {
    y: keyof ConnectionMap;
    x: keyof ConnectionMap;
  };
}

interface Target {
  id: keyof ConnectionMap;
  x: number;
  y: number;
}

interface Shape {
  color: string;
  highlight: boolean;
  id: string;
  connections: ConnectionMap;
  targets: Target[];
}

const Template: Story<any> = (args) => {
  const [boxes, setBoxes] = useState<Shape[]>([
    {
      color: "red",
      highlight: false,
      id: "a",
      connections: {
        a0: {
          x: "a1",
          y: "a3",
        },
        a1: {
          x: "a0",
          y: "a2",
        },
        a2: {
          x: "a3",
          y: "a1",
        },
        a3: {
          x: "a2",
          y: "a0",
        },
      },
      targets: [
        { id: "a0", x: 0, y: 0 },
        { id: "a1", x: 0, y: 0.5 },
        { id: "a2", x: 0.5, y: 0.5 },
        { id: "a3", x: 0.5, y: 0 },
      ],
    },
    {
      color: "cyan",
      highlight: false,
      id: "b",
      connections: {
        b0: {
          x: "b1",
          y: "b3",
        },
        b1: {
          x: "b0",
          y: "b2",
        },
        b2: {
          x: "b3",
          y: "b1",
        },
        b3: {
          x: "b2",
          y: "b0",
        },
      },
      targets: [
        { id: "b0", x: 0.2, y: 0.2 },
        { id: "b1", x: 0.2, y: 0.6 },
        { id: "b2", x: 0.8, y: 0.6 },
        { id: "b3", x: 0.8, y: 0.2 },
      ],
    },
  ]);

  const editingRef = useRef<string | null>(null);
  const draggingRef = useRef(false);

  return (
    <Canvas
      shapes={{
        box: boxes,
      }}
      render={{
        box: (c, blob) => {
          const xMin = Math.min(...blob.targets.map((t: any) => t.x));
          const yMin = Math.min(...blob.targets.map((t: any) => t.y));
          const xMax = Math.max(...blob.targets.map((t: any) => t.x));
          const yMax = Math.max(...blob.targets.map((t: any) => t.y));
          const x = xMin;
          const y = yMin;
          const width = xMax - xMin;
          const height = yMax - yMin;

          c.drawBox(
            { x, y, width, height },
            { color: blob.color, highlight: blob.highlight }
          );
        },
      }}
      actions={{
        box: {
          onTargetMove: (coords, { shapeID, targetID }) => {
            const newBoxes = produce(boxes, (draft) => {
              const shape = draft.find((s) => s.id === shapeID);
              if (shape === undefined) {
                // this should never happen.
                console.error("BOX.onMove: shape is undefined");
                return;
              }

              const { targets, connections } = shape;

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
                txy.x = coords.x;
                txy.y = coords.y;

                tx.x = coords.x;
                ty.y = coords.y;
                return;
              }

              // this should never happen.
              console.error("BOX.onMove: point is not connected");
            });

            setBoxes(newBoxes);
          },
          onMouseDown: () => {
            draggingRef.current = true;
          },
          onMouseMove: (coords) => {
            if (draggingRef.current === false) {
              return;
            }
            if (editingRef.current === null) {
              const id = uuidv4();
              editingRef.current = id;
              setBoxes([
                ...boxes,
                {
                  color: "pink",
                  highlight: false,
                  id: id,
                  connections: {
                    [`${id}-0`]: {
                      x: `${id}-1`,
                      y: `${id}-3`,
                    },
                    [`${id}-1`]: {
                      x: `${id}-0`,
                      y: `${id}-2`,
                    },
                    [`${id}-2`]: {
                      x: `${id}-3`,
                      y: `${id}-1`,
                    },
                    [`${id}-3`]: {
                      x: `${id}-2`,
                      y: `${id}-0`,
                    },
                  },
                  targets: [
                    { id: `${id}-0`, x: coords.x, y: coords.y },
                    { id: `${id}-1`, x: coords.x, y: coords.y },
                    { id: `${id}-2`, x: coords.x, y: coords.y },
                    { id: `${id}-3`, x: coords.x, y: coords.y },
                  ],
                },
              ]);
              return;
            }
            const newBoxes = produce(boxes, (draft) => {
              const box = draft.find((b) => b.id === editingRef.current);
              if (box) {
                box.targets[1].y = coords.y;

                box.targets[2].x = coords.x;
                box.targets[2].y = coords.y;

                box.targets[3].x = coords.x;
              }
            });

            setBoxes(newBoxes);
          },
          onMouseUp: (_coords, xScale, yScale) => {
            if (draggingRef.current === true && editingRef.current === null) {
              // click then click mode (vs drag to draw)
              return;
            }

            const box = boxes.find((b) => b.id === editingRef.current);
            if (box) {
              const xMin = Math.min(...box.targets.map((t: any) => t.x));
              const yMin = Math.min(...box.targets.map((t: any) => t.y));
              const xMax = Math.max(...box.targets.map((t: any) => t.x));
              const yMax = Math.max(...box.targets.map((t: any) => t.y));
              const width = xMax - xMin;
              const height = yMax - yMin;
              if (width * xScale <= 4 && height * yScale <= 4) {
                // click then click mode (vs drag to draw)
                return;
              }
            }

            draggingRef.current = false;
            editingRef.current = null;
          },
        },
      }}
      {...args}
    />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  mode: "move",
  image:
    "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg",
  tool: "box",
};
