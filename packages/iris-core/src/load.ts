/*
 * Copyright (c) International Business Machines
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createAsyncThunk } from "@reduxjs/toolkit";

import { api } from "@iris/api";

interface Options {
  projectID: string;
  connectionID: string;
  providerID: string;
}

export const load = createAsyncThunk(
  "load",
  async ({ projectID, connectionID, providerID }: Options) => {
    return await api.get("/project", {
      query: { projectID, connectionID, providerID },
    });
  }
);
