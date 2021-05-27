/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

import DrawingPanel from "../../panels/DrawingPanel";
import ImagesPanel from "../../panels/ImagesPanel";
import ShapesPanel from "../../panels/ShapesPanel";
import ToolOptionsPanel from "../../panels/ToolOptionsPanel";
import ToolsPanel from "../../panels/ToolsPanel";
import Layout from "./Layout";

function ObjectDetection() {
  return (
    <Layout
      top={<ToolOptionsPanel />}
      left={<ToolsPanel />}
      content={<DrawingPanel />}
      right={<ShapesPanel />}
      bottom={<ImagesPanel />}
    />
  );
}

export default ObjectDetection;
