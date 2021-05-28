/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Suspense, lazy } from "react";

import useSWR from "swr";

import { fetcher, endpoint } from "@iris/api";

// This will result in `<link rel="prefetch" href="login-modal-chunk.js">` being
// appended in the head of the page, which will instruct the browser to prefetch
// in idle time the `authenticated-app-chunk.js` file.
const AuthenticatedApp = lazy(
  () => import(/* webpackPrefetch: true */ "./AuthenticatedApp")
);
const UnauthenticatedApp = lazy(() => import("./UnauthenticatedApp"));

function App() {
  const { error } = useSWR(endpoint("/auth/status"), fetcher);

  // NOTE: pretends to be logged out if it returns any kind of error.
  // const authenticated = error?.status !== 401;
  const authenticated = error?.status === undefined;

  return (
    <Suspense fallback={<div>loading...</div>}>
      {authenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </Suspense>
  );
}

export default App;
