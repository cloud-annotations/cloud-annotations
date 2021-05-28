/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import ActiveLabel from "./ActiveLabel";
import BoxCanvasPlugin from "./BoxCanvasPlugin";

const moveStyle = {
  fill: "white",
};

const boxStyle = {
  fill: "white",
  fillOpacity: 0.2,
  stroke: "white",
  strokeWidth: 2,
};

export function activate(iris: any) {
  iris.tools.register({
    id: "move",
    displayName: "Move",
    priority: 100,
    icon: (
      <svg style={moveStyle} width="20" height="20" viewBox="0 0 40 40">
        <path d="M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" />
      </svg>
    ),
  });

  const boxTool = iris.tools.register({
    id: "box",
    canvasPlugin: new BoxCanvasPlugin(),
    displayName: "Bounding Box",
    displayNamePlural: "Bounding Boxes",
    icon: (
      <svg style={boxStyle} width="20" height="20" viewBox="0 0 40 40">
        <rect x="4" y="8" width="32" height="24" />
      </svg>
    ),
  });

  boxTool.options.register({
    component: <ActiveLabel />,
    priority: 100,
  });
}
