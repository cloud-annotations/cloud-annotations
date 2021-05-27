/*
 * Copyright (c) 2020 International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import ReactDOM from "react-dom";

import { CssBaseline, ThemeProvider } from "@material-ui/core";

import theme from "@iris/theme";

import { DIALOG_ROOT_ID } from ".";

export function showDialog<T>(Dialog: any, props: any): Promise<T | undefined> {
  return new Promise((resolve) => {
    const dialogRoot = document.getElementById(DIALOG_ROOT_ID);

    if (dialogRoot === null) {
      return resolve(undefined);
    }

    const handleClose = () => {
      ReactDOM.unmountComponentAtNode(dialogRoot);
      resolve(undefined);
    };

    const handleAction = (value: T) => {
      ReactDOM.unmountComponentAtNode(dialogRoot);
      resolve(value);
    };

    ReactDOM.render(
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Dialog onClose={handleClose} onAction={handleAction} {...props} />
        </ThemeProvider>
      </React.StrictMode>,
      dialogRoot
    );
  });
}
