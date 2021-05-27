/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";

export const DIALOG_ROOT_ID = "dialog-root";
export const FILE_INPUT_ID = "file-input";

function Dialog() {
  return (
    <React.Fragment>
      <div id={DIALOG_ROOT_ID} />
      <input type="file" id={FILE_INPUT_ID} style={{ display: "none" }} />
    </React.Fragment>
  );
}

export default Dialog;
export * from "./showDialog";
export * from "./showFileDialog";
export * from "./showConfirmDialog";
export * from "./showInputDialog";
