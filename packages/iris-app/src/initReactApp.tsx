/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense, lazy, useState } from "react";
import ReactDOM from "react-dom";

import { ThemeProvider, CssBaseline } from "@material-ui/core";
import { BrowserRouter as Router } from "react-router-dom";
import { SWRConfig } from "swr";

import { Dialog } from "@iris/components";
import theme from "@iris/theme";

import "./index.css";

// This will result in `<link rel="prefetch" href="login-modal-chunk.js">` being
// appended in the head of the page, which will instruct the browser to prefetch
// in idle time the `authenticated-app-chunk.js` file.
const AuthenticatedApp = lazy(
  () => import(/* webpackPrefetch: true */ "./AuthenticatedApp")
);
const UnauthenticatedApp = lazy(() => import("./UnauthenticatedApp"));

function App() {
  const [loggedOut, setLoggedOut] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <SWRConfig
          value={{
            errorRetryCount: 3,
            onError: (error, key) => {
              if (error.status === 401) {
                setLoggedOut(true);
              }
            },
          }}
        >
          <Suspense fallback={<div>loading...</div>}>
            {loggedOut ? <UnauthenticatedApp /> : <AuthenticatedApp />}
          </Suspense>
          <Dialog />
        </SWRConfig>
      </Router>
    </ThemeProvider>
  );
}

function initReactApp() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

export default initReactApp;
